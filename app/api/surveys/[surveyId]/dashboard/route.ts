import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Calculate statistics for a specific question
 */
async function calculateQuestionStatistics(
  supabase: any,
  surveyId: string,
  question: any
): Promise<any> {
  const { question_type, question_key } = question;
  
  // Get all responses for this survey
  const { data: responses, error } = await supabase
    .from('encuestas')
    .select('respuestas, created_at')
    .eq('survey_id', surveyId)
    .not('respuestas', 'is', null);

  if (error || !responses) {
    return {
      type: question_type,
      total_responses: 0,
      error: 'No se pudieron obtener las respuestas'
    };
  }

  const totalResponses = responses.length;

  switch (question_type) {
    case 'checkbox':
    case 'radio':
    case 'select': {
      // Calculate distribution
      const distribution: Record<string, number> = {};
      responses.forEach((r: any) => {
        const value = r.respuestas?.[question_key];
        if (value) {
          const key = String(value);
          distribution[key] = (distribution[key] || 0) + 1;
        }
      });
      return {
        type: question_type,
        total_responses: totalResponses,
        distribution
      };
    }

    case 'rating':
    case 'number': {
      const values: number[] = [];
      const distribution: Record<string, number> = {};
      
      responses.forEach((r: any) => {
        const value = r.respuestas?.[question_key];
        if (value != null) {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            values.push(numValue);
            const key = String(value);
            distribution[key] = (distribution[key] || 0) + 1;
          }
        }
      });

      const avg = values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : 0;

      return {
        type: question_type,
        total_responses: values.length,
        average: Math.round(avg * 100) / 100,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        distribution
      };
    }

    case 'boolean': {
      let yesCount = 0;
      let noCount = 0;
      
      responses.forEach((r: any) => {
        const value = r.respuestas?.[question_key];
        if (value === true || value === 'true' || value === 'Sí' || value === 'Si') {
          yesCount++;
        } else if (value === false || value === 'false' || value === 'No') {
          noCount++;
        }
      });

      const total = yesCount + noCount;
      return {
        type: 'boolean',
        total_responses: total,
        yes_count: yesCount,
        no_count: noCount,
        yes_percentage: total > 0 ? Math.round((yesCount / total) * 100 * 100) / 100 : 0,
        no_percentage: total > 0 ? Math.round((noCount / total) * 100 * 100) / 100 : 0
      };
    }

    case 'text':
    case 'phone': {
      const responsesList = responses
        .filter((r: any) => r.respuestas?.[question_key])
        .map((r: any) => ({
          value: r.respuestas[question_key],
          created_at: r.created_at
        }))
        .slice(0, 100);

      return {
        type: question_type,
        total_responses: responsesList.length,
        responses: responsesList
      };
    }

    default:
      return {
        type: question_type,
        total_responses: totalResponses,
        message: 'Tipo de pregunta no soportado para estadísticas'
      };
  }
}

/**
 * Build dashboard data manually from database queries
 */
async function buildDashboardManually(supabase: any, surveyId: string) {
  // Get survey info
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('id, title, slug, status')
    .eq('id', surveyId)
    .eq('status', 'active')
    .single();

  if (surveyError || !survey) {
    return { error: 'Encuesta no encontrada' };
  }

  // Get questions
  const { data: questions, error: questionsError } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('survey_id', surveyId)
    .eq('is_active', true)
    .order('order_index');

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
  }

  // Get response count and dates
  const { data: responses, error: responsesError } = await supabase
    .from('encuestas')
    .select('created_at')
    .eq('survey_id', surveyId);

  const totalResponses = responses?.length || 0;
  const lastResponseAt = responses && responses.length > 0
    ? responses.reduce((latest: any, r: any) => 
        new Date(r.created_at) > new Date(latest.created_at) ? r : latest
      ).created_at
    : null;
  const firstResponseAt = responses && responses.length > 0
    ? responses.reduce((earliest: any, r: any) => 
        new Date(r.created_at) < new Date(earliest.created_at) ? r : earliest
      ).created_at
    : null;

  // Calculate statistics for each question
  const questionsWithStats = questions ? await Promise.all(
    questions.map(async (q: any) => ({
      question_id: q.id,
      question_text: q.question_text,
      question_key: q.question_key,
      question_type: q.question_type,
      options: q.options,
      statistics: await calculateQuestionStatistics(supabase, surveyId, q)
    }))
  ) : [];

  return {
    survey_id: survey.id,
    survey_title: survey.title,
    survey_slug: survey.slug,
    total_responses: totalResponses,
    total_questions: questions?.length || 0,
    last_response_at: lastResponseAt,
    first_response_at: firstResponseAt,
    completion_rate: totalResponses > 0 ? 100 : 0, // Simplified calculation
    questions: questionsWithStats
  };
}

/**
 * GET /api/surveys/[surveyId]/dashboard
 * Retorna datos estructurados para renderizar el dashboard dinámico de una encuesta específica
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await context.params;

    if (!surveyId) {
      return NextResponse.json(
        { error: 'surveyId es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Try to use the RPC function first (if it exists)
    try {
      const { data: dashboardData, error: dashboardError } = await (supabase as any)
        .rpc('get_survey_dashboard', { p_survey_id: surveyId });

      // If RPC function works and returns data, use it
      if (!dashboardError && dashboardData && !dashboardData.error) {
        return NextResponse.json(dashboardData);
      }

      // If the error is that the function doesn't exist, fall back to manual query
      if (dashboardError && dashboardError.message?.includes('function')) {
        console.log('RPC function not found, building dashboard manually');
      } else if (dashboardError) {
        console.error('Error calling RPC function:', dashboardError);
      }
    } catch (rpcError) {
      console.log('RPC call failed, falling back to manual query:', rpcError);
    }

    // Fallback: Build dashboard data manually
    const dashboardData = await buildDashboardManually(supabase, surveyId);

    // If there's an error in the data
    if (dashboardData.error) {
      return NextResponse.json(
        { error: dashboardData.error },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al procesar la solicitud' },
      { status: 500 }
    );
  }
}
