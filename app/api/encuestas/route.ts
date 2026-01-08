import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Helper function to mask phone numbers (e.g., 5551234567 -> 55****4567)
const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone;
  const first2 = phone.substring(0, 2);
  const last4 = phone.substring(phone.length - 4);
  return `${first2}****${last4}`;
};

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { searchParams } = new URL(request.url);
    const showFullData = searchParams.get('full') === 'true';

    const { data, error } = await supabase
      .from('encuestas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si no se solicita datos completos, enmascarar teléfonos
    if (!showFullData && data) {
      const maskedData = data.map(item => ({
        ...item,
        telefono: maskPhone(item.telefono)
      }));
      return NextResponse.json(maskedData);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
