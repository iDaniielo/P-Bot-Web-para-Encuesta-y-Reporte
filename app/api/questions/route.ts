import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Helper para convertir preguntas de BD a formato de SurveyBot
function convertToSurveyQuestion(dbQuestion: any) {
  // Mapear tipos de BD a tipos del formulario
  const typeMap: Record<string, string> = {
    'phone': 'tel',
    'text': 'text',
    'checkbox': 'checkbox',
    'radio': 'radio',
    'select': 'select'
  };

  // Crear validación dinámica según las reglas
  let validation: z.ZodType<any>;
  const rules = dbQuestion.validation_rules || {};
  
  if (dbQuestion.question_type === 'phone') {
    validation = z.string().regex(/^\d{10}$/, 'El número debe tener exactamente 10 dígitos');
  } else if (dbQuestion.question_type === 'text') {
    const minLength = rules.minLength || 2;
    validation = z.string().min(minLength, `Debe tener al menos ${minLength} caracteres`);
  } else if (dbQuestion.question_type === 'checkbox') {
    validation = z.array(z.string()).min(1, 'Selecciona al menos una opción');
  } else {
    validation = z.string().min(1, 'Este campo es obligatorio');
  }

  return {
    id: dbQuestion.question_key,
    type: typeMap[dbQuestion.question_type] || dbQuestion.question_type,
    question: dbQuestion.question_text,
    placeholder: dbQuestion.question_type === 'text' ? `Ej: ${dbQuestion.question_text}` : undefined,
    options: dbQuestion.options || undefined,
    validation
  };
}

// Helper para sanitizar y validar question_key
function sanitizeQuestionKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Helper para validar estructura de pregunta
function validateQuestionData(data: Partial<Question>): { valid: boolean; error?: string } {
  // Validar campos obligatorios
  if (!data.question_text?.trim()) {
    return { valid: false, error: 'El texto de la pregunta es obligatorio' };
  }
  
  if (!data.question_key?.trim()) {
    return { valid: false, error: 'La clave de la pregunta es obligatoria' };
  }
  
  if (!data.question_type) {
    return { valid: false, error: 'El tipo de pregunta es obligatorio' };
  }
  
  // Validar tipo de pregunta
  const validTypes = ['text', 'phone', 'checkbox', 'radio', 'select', 'rating', 'boolean', 'number'];
  if (!validTypes.includes(data.question_type)) {
    return { 
      valid: false, 
      error: `Tipo de pregunta inválido. Debe ser uno de: ${validTypes.join(', ')}` 
    };
  }
  
  // Validar opciones para preguntas de selección múltiple
  if (['checkbox', 'radio', 'select'].includes(data.question_type)) {
    if (!data.options || data.options.length === 0) {
      return { 
        valid: false, 
        error: 'Las preguntas de tipo checkbox, radio o select deben tener al menos una opción' 
      };
    }
    
    // Validar que las opciones no estén vacías
    const emptyOptions = data.options.filter(opt => !opt.trim());
    if (emptyOptions.length > 0) {
      return { valid: false, error: 'Las opciones no pueden estar vacías' };
    }
    
    // Validar que no haya opciones duplicadas
    const uniqueOptions = new Set(data.options.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== data.options.length) {
      return { valid: false, error: 'No puede haber opciones duplicadas' };
    }
  }
  
  // Validar longitud del texto
  if (data.question_text.trim().length < 5) {
    return { valid: false, error: 'El texto de la pregunta debe tener al menos 5 caracteres' };
  }
  
  if (data.question_text.trim().length > 500) {
    return { valid: false, error: 'El texto de la pregunta no puede exceder 500 caracteres' };
  }
  
  return { valid: true };
}

// Helper para crear cliente de Supabase con autenticación desde cookies
async function createAuthenticatedClient() {
  const supabase = await createServerSupabaseClient();
  
  // Verificar si hay una sesión activa
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
  }
  
  return { 
    client: supabase, 
    isAuthenticated: !!session,
    user: session?.user || null 
  };
}

// Tipos
interface Question {
  id?: string;
  question_text: string;
  question_key: string;
  question_type: 'text' | 'phone' | 'checkbox' | 'radio' | 'select' | 'rating' | 'boolean' | 'number';
  options?: string[];
  validation_rules?: Record<string, any>;
  order_index: number;
  is_active: boolean;
  survey_id?: string | null;
}

// GET - Obtener todas las preguntas
export async function GET(request: Request) {
  try {
    const { client: supabase, isAuthenticated } = await createAuthenticatedClient();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false'; // Por defecto solo activas
    const surveyId = searchParams.get('surveyId'); // Filtrar por encuesta específica

    let query = supabase
      .from('survey_questions')
      .select('*')
      .order('order_index', { ascending: true });

    // Por defecto, solo mostrar preguntas activas (para el formulario público)
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    // Filtrar por survey_id si se proporciona
    if (surveyId) {
      query = query.eq('survey_id', surveyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      console.error('Is authenticated:', isAuthenticated);
      
      // Si es error de permisos y no está autenticado
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        if (!isAuthenticated) {
          return NextResponse.json(
            { 
              error: 'Error al obtener las preguntas', 
              details: 'Se requiere autenticación. Por favor, inicia sesión.',
              authError: true
            },
            { status: 403 }
          );
        } else {
          return NextResponse.json(
            { 
              error: 'Error al obtener las preguntas', 
              details: 'No tienes permisos para ver las preguntas. Verifica que el script SQL se ejecutó correctamente.',
              authError: true
            },
            { status: 403 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Error al obtener las preguntas', details: error.message },
        { status: 500 }
      );
    }

    // Si se solicita con active=false (gestión), devolver datos completos de BD
    // Si se solicita para la encuesta pública, convertir al formato del SurveyBot
    if (searchParams.get('active') === 'false') {
      // Para el QuestionManager, devolver datos completos sin conversión
      return NextResponse.json({ questions: data || [] });
    } else {
      // Para la encuesta pública, convertir al formato del SurveyBot
      const convertedQuestions = (data || []).map(convertToSurveyQuestion);
      return NextResponse.json({ questions: convertedQuestions });
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/questions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva pregunta
export async function POST(request: Request) {
  try {
    const { client: supabase, isAuthenticated } = await createAuthenticatedClient();
    
    // Verificar autenticación
    if (!isAuthenticated) {
      return NextResponse.json(
        { 
          error: 'No autenticado', 
          details: 'Debes iniciar sesión para crear preguntas' 
        },
        { status: 401 }
      );
    }
    
    const body: Question = await request.json();

    // Validar estructura completa de la pregunta
    const validation = validateQuestionData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Sanitizar question_key
    const sanitizedKey = sanitizeQuestionKey(body.question_key);
    
    if (sanitizedKey.length < 2) {
      return NextResponse.json(
        { error: 'La clave de la pregunta debe tener al menos 2 caracteres válidos' },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe una pregunta con la misma clave
    const { data: existingQuestion } = await supabase
      .from('survey_questions')
      .select('id, question_key')
      .eq('question_key', sanitizedKey)
      .single();
    
    if (existingQuestion) {
      return NextResponse.json(
        { 
          error: 'Ya existe una pregunta con esa clave',
          details: `La clave "${sanitizedKey}" ya está en uso`,
          suggestion: `Prueba con: ${sanitizedKey}_2`
        },
        { status: 409 }
      );
    }

    // Sanitizar opciones si existen
    const sanitizedOptions = body.options?.map(opt => opt.trim()).filter(opt => opt.length > 0);

    // Obtener el siguiente order_index
    const { data: maxOrderData } = await supabase
      .from('survey_questions')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = maxOrderData && maxOrderData.length > 0 
      ? (maxOrderData[0].order_index || 0) + 1 
      : 1;

    const newQuestion = {
      question_text: body.question_text.trim(),
      question_key: sanitizedKey,
      question_type: body.question_type,
      options: sanitizedOptions || null,
      validation_rules: body.validation_rules || { required: true },
      order_index: body.order_index || nextOrderIndex,
      is_active: body.is_active !== undefined ? body.is_active : true,
      survey_id: body.survey_id || null, // Include survey_id from request
    };

    const { data, error } = await supabase
      .from('survey_questions')
      .insert([newQuestion])
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      
      // Error de permisos
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        return NextResponse.json(
          { 
            error: 'Error al crear la pregunta', 
            details: 'No tienes permisos para crear preguntas. Verifica tu autenticación.',
            authError: true
          },
          { status: 403 }
        );
      }
      
      // Error de clave duplicada
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            error: 'Ya existe una pregunta con esa clave',
            details: error.message,
            suggestion: `Prueba con: ${sanitizedKey}_2`
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Error al crear la pregunta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pregunta creada exitosamente',
      data
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/questions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar pregunta existente
export async function PUT(request: Request) {
  try {
    const { client: supabase, isAuthenticated } = await createAuthenticatedClient();
    
    // Verificar autenticación
    if (!isAuthenticated) {
      return NextResponse.json(
        { 
          error: 'No autenticado', 
          details: 'Debes iniciar sesión para actualizar preguntas' 
        },
        { status: 401 }
      );
    }
    
    const body: Question = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'ID de pregunta requerido' },
        { status: 400 }
      );
    }

    // Si se actualizan campos principales, validar la estructura completa
    if (body.question_text || body.question_type || body.options) {
      const validation = validateQuestionData(body);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar (solo campos proporcionados)
    const updateData: any = {};
    if (body.question_text) updateData.question_text = body.question_text.trim();
    if (body.question_key) {
      const sanitizedKey = sanitizeQuestionKey(body.question_key);
      
      // Verificar si ya existe otra pregunta con la misma clave
      const { data: existingQuestion } = await supabase
        .from('survey_questions')
        .select('id, question_key')
        .eq('question_key', sanitizedKey)
        .neq('id', body.id)
        .single();
      
      if (existingQuestion) {
        return NextResponse.json(
          { 
            error: 'Ya existe otra pregunta con esa clave',
            suggestion: `Prueba con: ${sanitizedKey}_2`
          },
          { status: 409 }
        );
      }
      
      updateData.question_key = sanitizedKey;
    }
    if (body.question_type) updateData.question_type = body.question_type;
    if (body.options !== undefined) {
      updateData.options = body.options.map(opt => opt.trim()).filter(opt => opt.length > 0);
    }
    if (body.validation_rules !== undefined) updateData.validation_rules = body.validation_rules;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabase
      .from('survey_questions')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      
      // Error de permisos
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        return NextResponse.json(
          { 
            error: 'Error al actualizar la pregunta', 
            details: 'No tienes permisos para actualizar preguntas. Verifica tu autenticación.',
            authError: true
          },
          { status: 403 }
        );
      }
      
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            error: 'Ya existe otra pregunta con esa clave',
            details: error.message
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Error al actualizar la pregunta', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pregunta actualizada exitosamente',
      data
    });
  } catch (error) {
    console.error('Unexpected error in PUT /api/questions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar pregunta
export async function DELETE(request: Request) {
  try {
    const { client: supabase, isAuthenticated } = await createAuthenticatedClient();
    
    // Verificar autenticación
    if (!isAuthenticated) {
      return NextResponse.json(
        { 
          error: 'No autenticado', 
          details: 'Debes iniciar sesión para eliminar preguntas' 
        },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de pregunta requerido' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('survey_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      
      // Error de permisos
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        return NextResponse.json(
          { 
            error: 'Error al eliminar la pregunta', 
            details: 'No tienes permisos para eliminar preguntas. Verifica tu autenticación.',
            authError: true
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error al eliminar la pregunta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Pregunta eliminada exitosamente' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/questions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
