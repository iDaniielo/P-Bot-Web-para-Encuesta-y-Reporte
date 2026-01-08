import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/surveys/[surveyId]/statistics
 * Retorna estadísticas calculadas dinámicamente según las preguntas de la encuesta
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  try {
    const { surveyId } = params;
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!surveyId) {
      return NextResponse.json(
        { error: 'surveyId es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Si se especifica una pregunta específica, obtener solo sus estadísticas
    if (questionId) {
      const { data, error } = await supabase
        .rpc('calculate_question_statistics', {
          p_survey_id: surveyId,
          p_question_id: questionId,
        });

      if (error) {
        console.error('Error calculating question statistics:', error);
        return NextResponse.json(
          { error: 'Error al calcular estadísticas', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data || {});
    }

    // Si no se especifica pregunta, obtener estadísticas generales
    const { data: summary, error: summaryError } = await supabase
      .from('survey_statistics_summary')
      .select('*')
      .eq('survey_id', surveyId)
      .single();

    if (summaryError) {
      console.error('Error fetching summary:', summaryError);
      return NextResponse.json(
        { error: 'Error al obtener estadísticas generales', details: summaryError.message },
        { status: 500 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      );
    }

    // Obtener estadísticas de todas las preguntas
    const { data: questions, error: questionsError } = await supabase
      .from('survey_questions')
      .select('id, question_text, question_key, question_type, options')
      .eq('survey_id', surveyId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Error al obtener preguntas', details: questionsError.message },
        { status: 500 }
      );
    }

    // Calcular estadísticas para cada pregunta
    const questionsWithStats = await Promise.all(
      (questions || []).map(async (question) => {
        const { data: stats } = await supabase
          .rpc('calculate_question_statistics', {
            p_survey_id: surveyId,
            p_question_id: question.id,
          });

        return {
          ...question,
          statistics: stats || {},
        };
      })
    );

    return NextResponse.json({
      summary,
      questions: questionsWithStats,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al procesar la solicitud' },
      { status: 500 }
    );
  }
}
