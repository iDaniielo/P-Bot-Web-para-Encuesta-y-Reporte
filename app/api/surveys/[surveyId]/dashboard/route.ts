import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/surveys/[surveyId]/dashboard
 * Retorna datos estructurados para renderizar el dashboard dinámico de una encuesta específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  try {
    const { surveyId } = params;

    if (!surveyId) {
      return NextResponse.json(
        { error: 'surveyId es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Usar la función de base de datos para obtener el dashboard completo
    const { data: dashboardData, error: dashboardError } = await supabase
      .rpc('get_survey_dashboard', { p_survey_id: surveyId });

    if (dashboardError) {
      console.error('Error fetching dashboard:', dashboardError);
      return NextResponse.json(
        { error: 'Error al obtener el dashboard', details: dashboardError.message },
        { status: 500 }
      );
    }

    // Si la función devuelve un error (encuesta no encontrada)
    if (dashboardData && dashboardData.error) {
      return NextResponse.json(
        { error: dashboardData.error },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboardData || {});
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al procesar la solicitud' },
      { status: 500 }
    );
  }
}
