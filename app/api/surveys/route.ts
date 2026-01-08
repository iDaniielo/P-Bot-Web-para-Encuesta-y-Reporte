import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

// GET - List all surveys or filter by status/group/slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const groupId = searchParams.get('groupId');
    const slug = searchParams.get('slug');
    const includeQuestions = searchParams.get('includeQuestions') === 'true';
    const includeCounts = searchParams.get('includeCounts') === 'true';

    const supabase = await createServerSupabaseClient();
    
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
    if (status && (status === 'draft' || status === 'active' || status === 'archived')) {
      query = query.eq('status', status);
    }

    if (groupId) {
      query = query.eq('survey_group_id', groupId);
    }

    if (slug) {
      const { data: survey, error } = await supabase
        .from('surveys')
        .select(`
          *,
          survey_groups (
            id,
            name,
            description
          )
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching survey by slug:', error);
        return NextResponse.json(
          { error: 'Encuesta no encontrada', details: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json({ survey });
    }

    const { data: surveys, error } = await query;

    if (error) {
      console.error('Error fetching surveys:', error);
      return NextResponse.json(
        { error: 'Error al cargar las encuestas', details: error.message },
        { status: 500 }
      );
    }

    // If includeCounts is true, fetch question and response counts
    let surveysWithCounts = surveys;
    if (includeCounts && surveys) {
      surveysWithCounts = await Promise.all(
        surveys.map(async (survey) => {
          const [questionsResult, responsesResult] = await Promise.all([
            supabase
              .from('survey_questions')
              .select('id', { count: 'exact', head: true })
              .eq('survey_id', survey.id),
            supabase
              .from('encuestas')
              .select('id', { count: 'exact', head: true })
              .eq('survey_id', survey.id)
          ]);

          return {
            ...survey,
            questions_count: questionsResult.count || 0,
            responses_count: responsesResult.count || 0,
          };
        })
      );
    }

    // If includeQuestions is true, fetch questions for each survey
    if (includeQuestions && surveysWithCounts) {
      const surveysWithQuestions = await Promise.all(
        surveysWithCounts.map(async (survey) => {
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

    return NextResponse.json({ surveys: surveysWithCounts || [] });
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
    const supabase = await createServerSupabaseClient();
    
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
    const { title, description, survey_group_id, status = 'draft', slug: providedSlug } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'El título de la encuesta es obligatorio' },
        { status: 400 }
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { error: 'El título no puede exceder 200 caracteres' },
        { status: 400 }
      );
    }

    if (description && description.trim().length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }

    // Generate slug or use provided one
    let slug = providedSlug?.trim() || generateSlug(title);
    
    // Ensure slug is unique (with reasonable limit to prevent infinite loop)
    let finalSlug = slug;
    let counter = 1;
    const maxAttempts = 100;
    
    while (counter < maxAttempts) {
      const { data: existingSurvey } = await supabase
        .from('surveys')
        .select('id')
        .eq('slug', finalSlug)
        .single();
      
      if (!existingSurvey) break;
      
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    
    if (counter >= maxAttempts) {
      return NextResponse.json(
        { error: 'No se pudo generar un slug único. Por favor, proporciona un slug manualmente.' },
        { status: 409 }
      );
    }

    // Insert survey
    const { data: survey, error } = await supabase
      .from('surveys')
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || null,
          slug: finalSlug,
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
    const supabase = await createServerSupabaseClient();
    
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
    const { id, title, description, survey_group_id, status, slug: providedSlug } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de encuesta es obligatorio' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) {
      if (title.trim().length === 0) {
        return NextResponse.json(
          { error: 'El título no puede estar vacío' },
          { status: 400 }
        );
      }
      if (title.trim().length > 200) {
        return NextResponse.json(
          { error: 'El título no puede exceder 200 caracteres' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      if (description && description.trim().length > 500) {
        return NextResponse.json(
          { error: 'La descripción no puede exceder 500 caracteres' },
          { status: 400 }
        );
      }
      updateData.description = description?.trim() || null;
    }
    if (survey_group_id !== undefined) updateData.survey_group_id = survey_group_id;
    if (status !== undefined) updateData.status = status;
    
    // Handle slug update
    if (providedSlug !== undefined) {
      const newSlug = providedSlug.trim() || (title ? generateSlug(title) : null);
      
      if (newSlug) {
        // Check if slug is unique (excluding current survey)
        const { data: existingSurvey } = await supabase
          .from('surveys')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id)
          .single();
        
        if (existingSurvey) {
          return NextResponse.json(
            { error: 'Ya existe otra encuesta con ese slug' },
            { status: 409 }
          );
        }
        
        updateData.slug = newSlug;
      }
    } else if (title !== undefined) {
      // Auto-update slug if title is changed
      const newSlug = generateSlug(title);
      
      // Check uniqueness
      const { data: existingSurvey } = await supabase
        .from('surveys')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();
      
      if (!existingSurvey) {
        updateData.slug = newSlug;
      }
    }

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
    const supabase = await createServerSupabaseClient();
    
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
