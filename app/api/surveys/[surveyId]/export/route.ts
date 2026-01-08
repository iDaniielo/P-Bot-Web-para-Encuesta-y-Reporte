import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

/**
 * GET /api/surveys/[surveyId]/export/excel
 * Genera y descarga un archivo Excel con todas las respuestas y estadísticas de la encuesta
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

    // Obtener información de la encuesta
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Encuesta no encontrada' },
        { status: 404 }
      );
    }

    // Obtener preguntas de la encuesta
    const { data: questions, error: questionsError } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (questionsError) {
      return NextResponse.json(
        { error: 'Error al obtener preguntas', details: questionsError.message },
        { status: 500 }
      );
    }

    // Obtener respuestas de la encuesta
    const { data: responses, error: responsesError } = await supabase
      .from('encuestas')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (responsesError) {
      return NextResponse.json(
        { error: 'Error al obtener respuestas', details: responsesError.message },
        { status: 500 }
      );
    }

    // Obtener estadísticas usando la función de base de datos
    const { data: dashboardData } = await supabase
      .rpc('get_survey_dashboard', { p_survey_id: surveyId });

    // Crear el workbook
    const wb = XLSX.utils.book_new();

    // =========================================================================
    // HOJA 1: Metadata de la encuesta
    // =========================================================================
    const metadataData = [
      ['INFORMACIÓN DE LA ENCUESTA'],
      [''],
      ['Título', survey.title || 'Sin título'],
      ['Descripción', survey.description || 'Sin descripción'],
      ['Slug', survey.slug || 'N/A'],
      ['Estado', survey.status || 'N/A'],
      ['Fecha de creación', new Date(survey.created_at).toLocaleString('es-MX')],
      [''],
      ['RESUMEN DE RESPUESTAS'],
      ['Total de preguntas', (questions || []).length],
      ['Total de respuestas', (responses || []).length],
      ['Última respuesta', responses && responses.length > 0 ? new Date(responses[0].created_at).toLocaleString('es-MX') : 'Sin respuestas'],
      [''],
      ['Generado el', new Date().toLocaleString('es-MX')],
    ];

    const wsMetadata = XLSX.utils.aoa_to_sheet(metadataData);
    wsMetadata['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsMetadata, 'Metadata');

    // =========================================================================
    // HOJA 2: Respuestas (una columna por pregunta)
    // =========================================================================
    const responsesHeaders = [
      'ID',
      'Fecha de respuesta',
      ...(questions || []).map((q) => q.question_text),
    ];

    const responsesData = [responsesHeaders];

    (responses || []).forEach((response) => {
      const row = [
        response.id,
        new Date(response.created_at).toLocaleString('es-MX'),
      ];

      // Agregar respuesta para cada pregunta
      (questions || []).forEach((question) => {
        let value = 'Sin respuesta';

        if (response.respuestas && typeof response.respuestas === 'object') {
          const respuestas = response.respuestas as Record<string, any>;
          const answer = respuestas[question.question_key];

          if (answer !== undefined && answer !== null) {
            // Formatear según tipo de pregunta
            if (Array.isArray(answer)) {
              value = answer.join(', ');
            } else if (typeof answer === 'boolean') {
              value = answer ? 'Sí' : 'No';
            } else {
              value = String(answer);
            }
          }
        }

        row.push(value);
      });

      responsesData.push(row);
    });

    const wsResponses = XLSX.utils.aoa_to_sheet(responsesData);
    
    // Auto-ajustar columnas
    const colWidths = responsesHeaders.map((header, idx) => {
      if (idx === 0) return { wch: 10 }; // ID
      if (idx === 1) return { wch: 20 }; // Fecha
      return { wch: 30 }; // Preguntas
    });
    wsResponses['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, wsResponses, 'Respuestas');

    // =========================================================================
    // HOJA 3: Estadísticas por pregunta
    // =========================================================================
    const statisticsData: any[][] = [
      ['ESTADÍSTICAS POR PREGUNTA'],
      [''],
    ];

    if (dashboardData && dashboardData.questions) {
      dashboardData.questions.forEach((questionData: any) => {
        statisticsData.push([questionData.question_text]);
        statisticsData.push(['Tipo', questionData.question_type]);
        
        const stats = questionData.statistics || {};
        
        // Agregar estadísticas según el tipo
        switch (questionData.question_type) {
          case 'checkbox':
          case 'radio':
          case 'select':
            statisticsData.push(['']);
            statisticsData.push(['Opción', 'Cantidad', 'Porcentaje']);
            
            if (stats.distribution) {
              const totalResponses = stats.total_responses || 1;
              Object.entries(stats.distribution).forEach(([option, count]: [string, any]) => {
                const percentage = ((count / totalResponses) * 100).toFixed(2);
                statisticsData.push([option, count, `${percentage}%`]);
              });
            }
            break;

          case 'rating':
          case 'number':
            if (stats.average !== undefined) {
              statisticsData.push(['Promedio', stats.average]);
            }
            if (stats.min !== undefined) {
              statisticsData.push(['Mínimo', stats.min]);
            }
            if (stats.max !== undefined) {
              statisticsData.push(['Máximo', stats.max]);
            }
            
            if (stats.distribution) {
              statisticsData.push(['']);
              statisticsData.push(['Valor', 'Frecuencia']);
              Object.entries(stats.distribution).forEach(([value, count]: [string, any]) => {
                statisticsData.push([value, count]);
              });
            }
            break;

          case 'boolean':
            if (stats.yes_count !== undefined) {
              statisticsData.push(['Sí', `${stats.yes_count} (${stats.yes_percentage || 0}%)`]);
            }
            if (stats.no_count !== undefined) {
              statisticsData.push(['No', `${stats.no_count} (${stats.no_percentage || 0}%)`]);
            }
            break;

          case 'text':
          case 'phone':
            statisticsData.push(['Total de respuestas', stats.total_responses || 0]);
            break;
        }
        
        statisticsData.push(['']);
        statisticsData.push(['']);
      });
    }

    const wsStatistics = XLSX.utils.aoa_to_sheet(statisticsData);
    wsStatistics['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsStatistics, 'Estadísticas');

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Crear nombre de archivo
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${survey.slug || 'encuesta'}_${timestamp}.xlsx`;

    // Retornar archivo como descarga
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al generar el Excel' },
      { status: 500 }
    );
  }
}
