import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - List all surveys or filter by status/group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const groupId = searchParams.get('groupId');
    const includeQuestions = searchParams.get('includeQuestions') === 'true';

    const supabase = createServerClient();
    
    let query = supabase
      .from('surveys')
      .select(`
        *,
        survey_groups (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (groupId) {
      query = query.eq('survey_group_id', groupId);
    }

    const { data: surveys, error } = await query;

    if (error) {
      console.error('Error fetching surveys:', error);
      return NextResponse.json(
        { error: 'Error al cargar las encuestas', details: error.message },
        { status: 500 }
      );
    }

    // If includeQuestions is true, fetch questions for each survey
    if (includeQuestions && surveys) {
      const surveysWithQuestions = await Promise.all(
        surveys.map(async (survey) => {
          const { data: questions } = await supabase
            .from('survey_questions')
            .select('*')
            .eq('survey_id', survey.id)
            .eq('is_active', true)
            .order('order_index', { ascending: true });

          return {
            ...survey,
            questions: questions || [],
          };
        })
      );

      return NextResponse.json({ surveys: surveysWithQuestions });
    }

    return NextResponse.json({ surveys: surveys || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// POST - Create a new survey
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, survey_group_id, status = 'draft' } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'El título de la encuesta es obligatorio' },
        { status: 400 }
      );
    }

    // Insert survey
    const { data: survey, error } = await supabase
      .from('surveys')
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || null,
          survey_group_id: survey_group_id || null,
          status,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating survey:', error);
      return NextResponse.json(
        { error: 'Error al crear la encuesta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al crear la encuesta' },
      { status: 500 }
    );
  }
}

// PATCH - Update a survey
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, description, survey_group_id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de encuesta es obligatorio' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (survey_group_id !== undefined) updateData.survey_group_id = survey_group_id;
    if (status !== undefined) updateData.status = status;

    // Update survey
    const { data: survey, error } = await supabase
      .from('surveys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating survey:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la encuesta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al actualizar la encuesta' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a survey
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de encuesta es obligatorio' },
        { status: 400 }
      );
    }

    // Delete survey (cascade will handle questions and responses)
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting survey:', error);
      return NextResponse.json(
        { error: 'Error al eliminar la encuesta', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al eliminar la encuesta' },
      { status: 500 }
    );
  }
}
