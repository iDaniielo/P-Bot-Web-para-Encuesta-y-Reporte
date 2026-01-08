/**
 * Utilidades para calcular estadísticas según tipo de pregunta
 */

export interface QuestionStatistics {
  type: string;
  total_responses: number;
  [key: string]: any;
}

export interface MultipleChoiceStats extends QuestionStatistics {
  type: 'checkbox' | 'radio' | 'select';
  distribution: Record<string, number>;
  percentages: Record<string, number>;
}

export interface RatingStats extends QuestionStatistics {
  type: 'rating' | 'number';
  average: number;
  min: number;
  max: number;
  distribution: Record<string, number>;
}

export interface BooleanStats extends QuestionStatistics {
  type: 'boolean';
  yes_count: number;
  no_count: number;
  yes_percentage: number;
  no_percentage: number;
}

export interface TextStats extends QuestionStatistics {
  type: 'text' | 'phone';
  responses: Array<{ value: string; created_at: string }>;
}

/**
 * Calcula estadísticas para preguntas de opción múltiple
 */
export function calculateMultipleChoiceStatistics(
  responses: any[],
  questionKey: string
): MultipleChoiceStats {
  const distribution: Record<string, number> = {};
  let totalResponses = 0;

  responses.forEach((response) => {
    if (response.respuestas && response.respuestas[questionKey]) {
      const answer = response.respuestas[questionKey];
      
      if (Array.isArray(answer)) {
        // Para checkbox (múltiples respuestas)
        answer.forEach((value) => {
          distribution[value] = (distribution[value] || 0) + 1;
          totalResponses++;
        });
      } else {
        // Para radio/select (una sola respuesta)
        distribution[answer] = (distribution[answer] || 0) + 1;
        totalResponses++;
      }
    }
  });

  // Calcular porcentajes
  const percentages: Record<string, number> = {};
  Object.keys(distribution).forEach((key) => {
    percentages[key] = totalResponses > 0 
      ? Math.round((distribution[key] / totalResponses) * 100 * 100) / 100 
      : 0;
  });

  return {
    type: 'checkbox',
    total_responses: totalResponses,
    distribution,
    percentages,
  };
}

/**
 * Calcula estadísticas para preguntas de rating/número
 */
export function calculateRatingStatistics(
  responses: any[],
  questionKey: string
): RatingStats {
  const values: number[] = [];
  const distribution: Record<string, number> = {};

  responses.forEach((response) => {
    if (response.respuestas && response.respuestas[questionKey] !== undefined) {
      const value = Number(response.respuestas[questionKey]);
      if (!isNaN(value)) {
        values.push(value);
        const key = String(value);
        distribution[key] = (distribution[key] || 0) + 1;
      }
    }
  });

  const average = values.length > 0 
    ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100 
    : 0;
  
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  return {
    type: 'rating',
    total_responses: values.length,
    average,
    min,
    max,
    distribution,
  };
}

/**
 * Calcula estadísticas para preguntas booleanas
 */
export function calculateBooleanStatistics(
  responses: any[],
  questionKey: string
): BooleanStats {
  let yesCount = 0;
  let noCount = 0;

  responses.forEach((response) => {
    if (response.respuestas && response.respuestas[questionKey] !== undefined) {
      const value = response.respuestas[questionKey];
      
      if (value === true || value === 'true' || value === 'Sí' || value === 'Si' || value === 'yes') {
        yesCount++;
      } else if (value === false || value === 'false' || value === 'No' || value === 'no') {
        noCount++;
      }
    }
  });

  const total = yesCount + noCount;
  const yesPercentage = total > 0 ? Math.round((yesCount / total) * 100 * 100) / 100 : 0;
  const noPercentage = total > 0 ? Math.round((noCount / total) * 100 * 100) / 100 : 0;

  return {
    type: 'boolean',
    total_responses: total,
    yes_count: yesCount,
    no_count: noCount,
    yes_percentage: yesPercentage,
    no_percentage: noPercentage,
  };
}

/**
 * Calcula estadísticas para preguntas de texto
 */
export function calculateTextStatistics(
  responses: any[],
  questionKey: string
): TextStats {
  const textResponses: Array<{ value: string; created_at: string }> = [];

  responses.forEach((response) => {
    if (response.respuestas && response.respuestas[questionKey]) {
      textResponses.push({
        value: String(response.respuestas[questionKey]),
        created_at: response.created_at,
      });
    }
  });

  return {
    type: 'text',
    total_responses: textResponses.length,
    responses: textResponses.slice(0, 100), // Limitar a 100 respuestas
  };
}

/**
 * Calcula estadísticas según el tipo de pregunta
 */
export function calculateStatistics(
  questionType: string,
  responses: any[],
  questionKey: string
): QuestionStatistics {
  switch (questionType) {
    case 'checkbox':
    case 'radio':
    case 'select':
      return calculateMultipleChoiceStatistics(responses, questionKey);
    
    case 'rating':
    case 'number':
      return calculateRatingStatistics(responses, questionKey);
    
    case 'boolean':
      return calculateBooleanStatistics(responses, questionKey);
    
    case 'text':
    case 'phone':
      return calculateTextStatistics(responses, questionKey);
    
    default:
      return {
        type: questionType,
        total_responses: 0,
      };
  }
}

/**
 * Obtiene color para gráficos según índice
 */
export function getChartColor(index: number): string {
  const colors = [
    '#dc2626', // red-600
    '#16a34a', // green-600
    '#2563eb', // blue-600
    '#ca8a04', // yellow-600
    '#9333ea', // purple-600
    '#ea580c', // orange-600
    '#0891b2', // cyan-600
    '#db2777', // pink-600
    '#65a30d', // lime-600
    '#7c3aed', // violet-600
  ];
  
  return colors[index % colors.length];
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

/**
 * Formatea una fecha
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
