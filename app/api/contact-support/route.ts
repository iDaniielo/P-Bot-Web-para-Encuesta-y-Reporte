import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema using Zod
const contactSupportSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  email: z.string().email('Email inválido').max(100, 'El email es muy largo'),
  phone: z.string().max(20, 'El teléfono es muy largo').optional(),
  message: z.string().min(1, 'El mensaje es requerido').max(1000, 'El mensaje es muy largo'),
});

// Sanitize input to prevent injection attacks
// This is a basic sanitization that escapes HTML entities
// For production, consider using a library like DOMPurify
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Check rate limiting: max 3 requests per user every 10 minutes
async function checkRateLimit(supabase: any, userId: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  // Clean up old entries first
  await supabase
    .from('support_request_rate_limit')
    .delete()
    .lt('window_start', tenMinutesAgo);
  
  // Get current window count
  const { data, error } = await supabase
    .from('support_request_rate_limit')
    .select('request_count, window_start')
    .eq('user_id', userId)
    .gte('window_start', tenMinutesAgo)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Rate limit check error:', error);
    return true; // Allow on error to not block legitimate users
  }
  
  if (!data) {
    // First request in this window - create new entry
    await supabase
      .from('support_request_rate_limit')
      .insert({ user_id: userId, request_count: 1 });
    return true;
  }
  
  if (data.request_count >= 3) {
    return false; // Rate limit exceeded
  }
  
  // Increment counter
  await supabase
    .from('support_request_rate_limit')
    .update({ request_count: data.request_count + 1 })
    .eq('user_id', userId)
    .eq('window_start', data.window_start);
  
  return true;
}

// Send email notification to admin
async function sendEmailNotification(
  data: { name: string; email: string; phone?: string; message: string }
) {
  try {
    // Get the admin email from environment variable
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.error('No admin email configured. Please set ADMIN_EMAIL environment variable.');
      return;
    }
    
    // Format the email body
    const emailBody = `
Nueva solicitud de ayuda recibida en el Dashboard CEO

Detalles de la solicitud:
- Nombre: ${data.name}
- Email: ${data.email}
${data.phone ? `- Teléfono: ${data.phone}` : ''}
- Mensaje: ${data.message}

Fecha: ${new Date().toLocaleString('es-MX')}

---
Este email fue enviado automáticamente desde el sistema P-Bot.
    `.trim();
    
    // Note: Supabase doesn't have a built-in email sending API in the client
    // We would need to integrate with a service like Resend, SendGrid, or use Supabase Edge Functions
    // For now, we'll log the email and you can implement the actual sending later
    console.log('Email notification would be sent to:', adminEmail);
    console.log('Subject: Nueva solicitud de ayuda - Dashboard CEO');
    console.log('Body:', emailBody);
    
    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@yourdomain.com',
    //     to: adminEmail,
    //     subject: 'Nueva solicitud de ayuda - Dashboard CEO',
    //     text: emailBody,
    //   }),
    // });
    
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw - we still want to save the request even if email fails
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Debe iniciar sesión.' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = contactSupportSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { name, email, phone, message } = validationResult.data;
    
    // Sanitize inputs
    const sanitizedData: {
      name: string;
      email: string;
      phone?: string;
      message: string;
    } = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      message: sanitizeInput(message),
    };
    
    if (phone) {
      sanitizedData.phone = sanitizeInput(phone);
    }
    
    // Check rate limiting
    const userId = session.user.id;
    const canProceed = await checkRateLimit(supabase, userId);
    
    if (!canProceed) {
      return NextResponse.json(
        { error: 'Límite de solicitudes excedido. Por favor, espere 10 minutos antes de enviar otra solicitud.' },
        { status: 429 }
      );
    }
    
    // Save to database
    const { data: insertedData, error: insertError } = await supabase
      .from('support_requests')
      .insert([sanitizedData])
      .select()
      .single();
    
    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Error al guardar la solicitud. Por favor, intente nuevamente.' },
        { status: 500 }
      );
    }
    
    // Send email notification (async, don't block response)
    sendEmailNotification(sanitizedData).catch(err => 
      console.error('Email notification failed:', err)
    );
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitud enviada correctamente. Nos pondremos en contacto pronto.',
        data: insertedData 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Unexpected error in contact-support endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Por favor, intente nuevamente.' },
      { status: 500 }
    );
  }
}
