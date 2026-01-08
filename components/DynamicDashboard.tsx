'use client';

import { useEffect, useState } from 'react';
import { Loader2, Download, TrendingUp, Users, Calendar, CheckCircle } from 'lucide-react';
import StatisticWidget from './StatisticWidget';

interface DynamicDashboardProps {
  surveyId: string;
}

interface DashboardData {
  survey_id: string;
  survey_title: string;
  survey_slug: string;
  total_responses: number;
  total_questions: number;
  last_response_at: string | null;
  first_response_at: string | null;
  completion_rate: number;
  questions: Array<{
    question_id: string;
    question_text: string;
    question_key: string;
    question_type: string;
    options: any;
    statistics: any;
  }>;
}

/**
 * Dashboard dinámico que muestra estadísticas según la estructura de la encuesta
 */
export default function DynamicDashboard({ surveyId }: DynamicDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/surveys/${surveyId}/dashboard`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar el dashboard');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);

      const response = await fetch(`/api/surveys/${surveyId}/export`);
      
      if (!response.ok) {
        throw new Error('Error al exportar Excel');
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `encuesta_${data?.survey_slug || surveyId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Error al exportar Excel. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Error al cargar el dashboard</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-600">No hay datos disponibles para esta encuesta</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y botón de exportar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.survey_title}</h2>
            <p className="text-sm text-gray-500 mt-1">/{data.survey_slug}</p>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={exporting || data.total_responses === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar a Excel
              </>
            )}
          </button>
        </div>

        {/* Métricas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Total Respuestas</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{data.total_responses}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Preguntas</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{data.total_questions}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Completitud</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{data.completion_rate}%</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-700 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Última Respuesta</span>
            </div>
            <p className="text-sm font-semibold text-orange-900">
              {data.last_response_at 
                ? new Date(data.last_response_at).toLocaleDateString('es-MX')
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Widgets de estadísticas por pregunta */}
      {data.questions && data.questions.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Estadísticas por Pregunta</h3>
          {data.questions.map((question) => (
            <StatisticWidget
              key={question.question_id}
              questionText={question.question_text}
              questionType={question.question_type}
              statistics={question.statistics}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600">
            Esta encuesta no tiene preguntas activas
          </p>
        </div>
      )}
    </div>
  );
}
