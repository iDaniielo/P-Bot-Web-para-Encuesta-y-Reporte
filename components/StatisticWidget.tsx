'use client';

import { 
  PieChart, Pie, BarChart, Bar, Cell, Tooltip, Legend, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { getChartColor, formatPercentage } from '@/lib/statistics';

interface StatisticWidgetProps {
  questionText: string;
  questionType: string;
  statistics: any;
}

/**
 * Widget que renderiza diferentes tipos de gráficos según el tipo de pregunta
 */
export default function StatisticWidget({ 
  questionText, 
  questionType, 
  statistics 
}: StatisticWidgetProps) {
  
  // Renderizar según tipo de pregunta
  switch (questionType) {
    case 'checkbox':
    case 'radio':
    case 'select':
      return (
        <MultipleChoiceWidget
          questionText={questionText}
          statistics={statistics}
        />
      );
    
    case 'rating':
    case 'number':
      return (
        <RatingWidget
          questionText={questionText}
          statistics={statistics}
        />
      );
    
    case 'boolean':
      return (
        <BooleanWidget
          questionText={questionText}
          statistics={statistics}
        />
      );
    
    case 'text':
    case 'phone':
      return (
        <TextWidget
          questionText={questionText}
          statistics={statistics}
        />
      );
    
    default:
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {questionText}
          </h3>
          <p className="text-gray-500">
            Tipo de pregunta no soportado para visualización
          </p>
        </div>
      );
  }
}

/**
 * Widget para preguntas de opción múltiple (checkbox, radio, select)
 * Muestra gráfico de pastel y barras
 */
function MultipleChoiceWidget({ 
  questionText, 
  statistics 
}: { 
  questionText: string; 
  statistics: any;
}) {
  const distribution = statistics.distribution || {};
  const chartData = Object.entries(distribution).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  const totalResponses = statistics.total_responses || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {questionText}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Total de respuestas: {totalResponses}
      </p>

      {chartData.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de pastel */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
              Distribución
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de barras */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
              Frecuencia
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No hay respuestas para esta pregunta
        </p>
      )}
    </div>
  );
}

/**
 * Widget para preguntas de rating/calificación
 * Muestra gráfico de barras con promedio y distribución
 */
function RatingWidget({ 
  questionText, 
  statistics 
}: { 
  questionText: string; 
  statistics: any;
}) {
  const distribution = statistics.distribution || {};
  const chartData = Object.entries(distribution)
    .map(([name, value]) => ({
      name,
      value: value as number,
    }))
    .sort((a, b) => Number(a.name) - Number(b.name));

  const average = statistics.average || 0;
  const min = statistics.min || 0;
  const max = statistics.max || 0;
  const totalResponses = statistics.total_responses || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {questionText}
      </h3>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Promedio</p>
          <p className="text-2xl font-bold text-blue-600">{average}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Mínimo</p>
          <p className="text-2xl font-bold text-green-600">{min}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Máximo</p>
          <p className="text-2xl font-bold text-red-600">{max}</p>
        </div>
      </div>

      {/* Gráfico de distribución */}
      {chartData.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No hay respuestas para esta pregunta
        </p>
      )}
    </div>
  );
}

/**
 * Widget para preguntas booleanas (Sí/No)
 * Muestra gráfico de dona con porcentajes
 */
function BooleanWidget({ 
  questionText, 
  statistics 
}: { 
  questionText: string; 
  statistics: any;
}) {
  const yesCount = statistics.yes_count || 0;
  const noCount = statistics.no_count || 0;
  const yesPercentage = statistics.yes_percentage || 0;
  const noPercentage = statistics.no_percentage || 0;
  const totalResponses = statistics.total_responses || 0;

  const chartData = [
    { name: 'Sí', value: yesCount, percentage: yesPercentage },
    { name: 'No', value: noCount, percentage: noPercentage },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {questionText}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Total de respuestas: {totalResponses}
      </p>

      {totalResponses > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de dona */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Desglose numérico */}
          <div className="flex flex-col justify-center">
            <div className="bg-green-50 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-green-900 font-semibold">Sí</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{yesCount}</div>
                  <div className="text-sm text-green-700">{yesPercentage}%</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-red-900 font-semibold">No</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{noCount}</div>
                  <div className="text-sm text-red-700">{noPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No hay respuestas para esta pregunta
        </p>
      )}
    </div>
  );
}

/**
 * Widget para preguntas de texto abierto
 * Muestra lista de respuestas
 */
function TextWidget({ 
  questionText, 
  statistics 
}: { 
  questionText: string; 
  statistics: any;
}) {
  const responses = statistics.responses || [];
  const totalResponses = statistics.total_responses || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {questionText}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Total de respuestas: {totalResponses}
      </p>

      {responses.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {responses.map((response: any, index: number) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <p className="text-gray-900">{response.value}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(response.created_at).toLocaleDateString('es-MX')}
              </p>
            </div>
          ))}
          {totalResponses > responses.length && (
            <p className="text-sm text-gray-500 text-center pt-2">
              Mostrando {responses.length} de {totalResponses} respuestas
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No hay respuestas para esta pregunta
        </p>
      )}
    </div>
  );
}
