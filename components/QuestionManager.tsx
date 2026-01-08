'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MoveUp, MoveDown, Copy } from 'lucide-react';
import type { Survey } from '@/types/database';

interface Question {
  id?: string;
  question_text: string;
  question_key: string;
  question_type: 'text' | 'phone' | 'checkbox' | 'radio' | 'select';
  options?: string[];
  validation_rules?: Record<string, any>;
  order_index: number;
  is_active: boolean;
  survey_id?: string | null;
}

export default function QuestionManager() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Question>>({
    question_text: '',
    question_key: '',
    question_type: 'text',
    options: [],
    is_active: true,
  });

  // Load surveys on mount
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys');
        if (response.ok) {
          const data = await response.json();
          const surveyList = data.surveys || [];
          setSurveys(surveyList);
          // Set default survey if available
          if (surveyList.length > 0) {
            setSelectedSurveyId(surveyList[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading surveys:', err);
      }
    };

    fetchSurveys();
  }, []);

  // Cargar preguntas when survey changes
  useEffect(() => {
    if (selectedSurveyId) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSurveyId]);

  const fetchQuestions = async () => {
    if (!selectedSurveyId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/questions?active=false&surveyId=${selectedSurveyId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || 
          'Error al cargar preguntas. Verifica que la tabla survey_questions existe en Supabase.'
        );
      }
      
      const data = await response.json();
      // La API devuelve {questions: [...]}
      const questionsArray = data.questions || data;
      setQuestions(Array.isArray(questionsArray) ? questionsArray : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al cargar preguntas. Por favor, verifica que ejecutaste el script SQL en Supabase.'
      );
      setQuestions([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Crear pregunta
  const handleCreate = async () => {
    try {
      setValidationErrors({});
      
      const questionData = {
        ...formData,
        survey_id: selectedSurveyId, // Associate with selected survey
      };
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.suggestion) {
          setValidationErrors({ 
            question_key: `${result.error}. ${result.suggestion}` 
          });
        }
        throw new Error(result.error || 'Error al crear pregunta');
      }

      await fetchQuestions();
      setIsCreating(false);
      resetForm();
      showSuccess('✅ Pregunta creada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear pregunta';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Actualizar pregunta
  const handleUpdate = async (id: string) => {
    try {
      setValidationErrors({});
      
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.suggestion) {
          setValidationErrors({ 
            question_key: `${result.error}. ${result.suggestion}` 
          });
        }
        throw new Error(result.error || 'Error al actualizar pregunta');
      }

      await fetchQuestions();
      setEditingId(null);
      resetForm();
      showSuccess('✅ Pregunta actualizada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar pregunta';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Eliminar pregunta
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/questions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar pregunta');
      }

      await fetchQuestions();
      showSuccess('🗑️ Pregunta eliminada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar pregunta';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Cambiar orden
  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex((q) => q.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[currentIndex], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[currentIndex]];

    // Actualizar order_index
    try {
      await Promise.all(
        updatedQuestions.map((q, idx) =>
          fetch('/api/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: q.id, order_index: idx + 1 }),
          })
        )
      );
      await fetchQuestions();
    } catch (err) {
      const errorMsg = 'Error al reordenar preguntas';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEdit = (question: Question) => {
    setEditingId(question.id || null);
    setFormData(question);
    setValidationErrors({});
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_key: '',
      question_type: 'text',
      options: [],
      is_active: true,
    });
    setValidationErrors({});
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Duplicar pregunta
  const handleDuplicate = (question: Question) => {
    const duplicatedQuestion = {
      ...question,
      question_text: `${question.question_text} (Copia)`,
      question_key: `${question.question_key}_copia`,
      id: undefined, // Remover ID para crear nueva
    };
    setFormData(duplicatedQuestion);
    setIsCreating(true);
    setValidationErrors({});
  };

  // Generar clave automáticamente desde el texto
  const generateKeyFromText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^áéíóúa-z0-9\s]/g, '')
      .replace(/[á]/g, 'a')
      .replace(/[é]/g, 'e')
      .replace(/[í]/g, 'i')
      .replace(/[ó]/g, 'o')
      .replace(/[úü]/g, 'u')
      .replace(/ñ/g, 'n')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 50);
  };

  // Usar plantilla predefinida
  const applyTemplate = (template: Partial<Question>) => {
    setFormData({ ...template, is_active: true });
    setIsCreating(true);
    setValidationErrors({});
  };


  const handleOptionsChange = (value: string) => {
    const optionsArray = value.split('\n').filter((opt) => opt.trim() !== '');
    setFormData({ ...formData, options: optionsArray });
  };

  // Plantillas predefinidas
  const questionTemplates: Partial<Question>[] = [
    {
      question_text: '¿Cuál es tu nombre completo?',
      question_key: 'nombre_completo',
      question_type: 'text',
    },
    {
      question_text: '¿Cuál es tu número de teléfono?',
      question_key: 'telefono',
      question_type: 'phone',
    },
    {
      question_text: '¿Cómo calificarías el servicio?',
      question_key: 'calificacion_servicio',
      question_type: 'radio',
      options: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Muy malo'],
    },
    {
      question_text: '¿Qué productos te interesan?',
      question_key: 'productos_interes',
      question_type: 'checkbox',
      options: ['Producto A', 'Producto B', 'Producto C', 'Otro'],
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Survey Selector */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
        <label className="block text-base font-bold text-gray-900 mb-3">
          Selecciona una encuesta para gestionar sus preguntas:
        </label>
        <select
          value={selectedSurveyId}
          onChange={(e) => setSelectedSurveyId(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 text-base"
          disabled={surveys.length === 0}
        >
          {surveys.length === 0 ? (
            <option value="">No hay encuestas disponibles</option>
          ) : (
            surveys.map((survey) => (
              <option key={survey.id} value={survey.id}>
                {survey.title} {survey.status !== 'active' ? `(${survey.status})` : ''}
              </option>
            ))
          )}
        </select>
        {surveys.length === 0 && (
          <p className="mt-2 text-sm text-gray-600">
            Crea una encuesta primero en la{' '}
            <a href="/dashboard/surveys" className="text-blue-600 hover:underline font-semibold">
              gestión de encuestas
            </a>
          </p>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Preguntas</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={!selectedSurveyId}
        >
          <Plus className="h-5 w-5" />
          <span className="font-bold">Nueva Pregunta</span>
        </button>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-pulse">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">⚠️ Error al cargar preguntas</p>
          <p className="text-sm mb-3">{error}</p>
          <details className="text-xs">
            <summary className="cursor-pointer font-medium hover:text-red-800">
              💡 ¿Cómo solucionar esto?
            </summary>
            <div className="mt-2 p-3 bg-white rounded border border-red-100">
              <p className="font-semibold mb-2">Pasos para solucionar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Ve a Supabase SQL Editor</li>
                <li>Abre el archivo: <code className="bg-gray-100 px-1">database/survey-questions-schema.sql</code></li>
                <li>Copia todo el contenido</li>
                <li>Pégalo en el SQL Editor</li>
                <li>Haz clic en &quot;Run&quot;</li>
                <li>Recarga esta página</li>
              </ol>
            </div>
          </details>
        </div>
      )}

      {/* Formulario de creación */}
      {isCreating && (
        <>
          {/* Plantillas rápidas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              🚀 Plantillas rápidas (clic para usar)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {questionTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => applyTemplate(template)}
                  className="text-left px-3 py-2 bg-white border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors text-sm"
                >
                  <div className="font-medium text-blue-900">{template.question_text}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Tipo: {template.question_type}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Pregunta</h3>
            <QuestionForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleCreate}
              onCancel={() => {
                setIsCreating(false);
                resetForm();
              }}
              onOptionsChange={handleOptionsChange}
              validationErrors={validationErrors}
              generateKeyFromText={generateKeyFromText}
            />
          </div>
        </>
      )}

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`bg-white border rounded-lg p-4 shadow-sm ${
              !question.is_active ? 'opacity-50' : ''
            }`}
          >
            {editingId === question.id ? (
              <QuestionForm
                formData={formData}
                setFormData={setFormData}
                onSave={() => handleUpdate(question.id!)}
                onCancel={() => {
                  setEditingId(null);
                  resetForm();
                }}
                onOptionsChange={handleOptionsChange}
                validationErrors={validationErrors}
                generateKeyFromText={generateKeyFromText}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-gray-500">
                      #{index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">
                      {question.question_text}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {question.question_type}
                    </span>
                    {!question.is_active && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Clave:</strong> {question.question_key}
                  </p>
                  {question.options && question.options.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Opciones:</strong> {question.options.join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleReorder(question.id!, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Subir"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(question.id!, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Bajar"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(question)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => startEdit(question)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {!selectedSurveyId && !isCreating && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Selecciona una encuesta arriba para gestionar sus preguntas</p>
          </div>
        )}

        {selectedSurveyId && questions.length === 0 && !isCreating && (
          <div className="text-center py-12 text-gray-500">
            No hay preguntas creadas. Haz clic en &quot;Nueva Pregunta&quot; para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de formulario reutilizable
interface QuestionFormProps {
  formData: Partial<Question>;
  setFormData: (data: Partial<Question>) => void;
  onSave: () => void;
  onCancel: () => void;
  onOptionsChange: (value: string) => void;
  validationErrors: Record<string, string>;
  generateKeyFromText: (text: string) => string;
}

function QuestionForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  onOptionsChange,
  validationErrors,
  generateKeyFromText,
}: QuestionFormProps) {
  const needsOptions = ['checkbox', 'radio', 'select'].includes(
    formData.question_type || ''
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto de la pregunta *
          </label>
          <input
            type="text"
            value={formData.question_text || ''}
            onChange={(e) => {
              setFormData({ ...formData, question_text: e.target.value });
              // Auto-generar clave si está vacía
              if (!formData.question_key && e.target.value) {
                const generatedKey = generateKeyFromText(e.target.value);
                setFormData({ 
                  ...formData, 
                  question_text: e.target.value,
                  question_key: generatedKey 
                });
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
              validationErrors.question_text ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="¿Cuál es tu nombre?"
          />
          {validationErrors.question_text && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.question_text}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.question_text?.length || 0}/500 caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clave única *
            <button
              type="button"
              onClick={() => {
                if (formData.question_text) {
                  const generatedKey = generateKeyFromText(formData.question_text);
                  setFormData({ ...formData, question_key: generatedKey });
                }
              }}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
            >
              🪄 Auto-generar
            </button>
          </label>
          <input
            type="text"
            value={formData.question_key || ''}
            onChange={(e) =>
              setFormData({ ...formData, question_key: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 ${
              validationErrors.question_key ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="nombre"
          />
          {validationErrors.question_key && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.question_key}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Solo letras minúsculas, números y guiones bajos
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de pregunta *
          </label>
          <select
            value={formData.question_type || 'text'}
            onChange={(e) =>
              setFormData({
                ...formData,
                question_type: e.target.value as Question['question_type'],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
          >
            <option value="text">Texto</option>
            <option value="phone">Teléfono</option>
            <option value="checkbox">Checkbox (múltiple)</option>
            <option value="radio">Radio (única opción)</option>
            <option value="select">Select (lista desplegable)</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active !== false}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Pregunta activa</span>
          </label>
        </div>
      </div>

      {needsOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opciones (una por línea) *
          </label>
          <textarea
            value={(formData.options || []).join('\n')}
            onChange={(e) => onOptionsChange(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
          />
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Guardar
        </button>
      </div>
    </div>
  );
}
