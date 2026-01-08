'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { surveyQuestions, type SurveyFormData, type SurveyQuestion } from '@/lib/survey-config';
import { z } from 'zod';
import Link from 'next/link';

interface SurveyBotProps {
  onComplete: (data: SurveyFormData) => Promise<void>;
  surveyId?: string;
}

// Helper para crear validación Zod basada en el tipo de pregunta
function createValidation(question: SurveyQuestion): z.ZodType<any> {
  switch (question.type) {
    case 'tel':
      return z.string().regex(/^\d{10}$/, 'El número debe tener exactamente 10 dígitos');
    case 'text':
      return z.string().min(2, `Debe tener al menos 2 caracteres`);
    case 'checkbox':
      return z.array(z.string()).min(1, 'Selecciona al menos una opción');
    case 'radio':
    case 'select':
      return z.string().min(1, 'Selecciona una opción');
    default:
      return z.string().min(1, 'Este campo es obligatorio');
  }
}

export default function SurveyBot({ onComplete, surveyId }: SurveyBotProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(surveyQuestions); // Iniciar con preguntas por defecto
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preguntas desde la API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const url = surveyId 
          ? `/api/questions?surveyId=${surveyId}`
          : '/api/questions';
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
          }
        }
      } catch (error) {
        // Mantener las preguntas por defecto si hay error
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [surveyId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setError,
    clearErrors,
  } = useForm<any>({
    mode: 'onChange',
  });

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Mostrar loading mientras se cargan las preguntas
  if (isLoading || questions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">Cargando preguntas...</p>
      </div>
    );
  }

  const handleNext = async () => {
    const fieldName = currentQuestion.id as keyof SurveyFormData;
    const fieldValue = getValues(fieldName as any);
    
    // Crear validación dinámica basada en el tipo de pregunta
    const validation = createValidation(currentQuestion);
    
    // Validación manual
    try {
      await validation.parseAsync(fieldValue);
      // Si la validación pasa, limpiar errores y avanzar
      clearErrors(fieldName);
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error: any) {
      // Mostrar el error de validación
      if (error.errors && error.errors[0]) {
        setError(fieldName, {
          type: 'manual',
          message: error.errors[0].message,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Validar todos los campos antes de enviar
      let allValid = true;
      for (const question of questions) {
        try {
          const validation = createValidation(question);
          await validation.parseAsync(data[question.id]);
        } catch (error) {
          allValid = false;
          break;
        }
      }

      if (!allValid) {
        setIsSubmitting(false);
        return;
      }

      await onComplete(data);
      setIsCompleted(true);
    } catch (error) {
      // Error al enviar la encuesta
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Gracias por participar!
        </h2>
        <p className="text-gray-800 text-lg">
          Tu respuesta ha sido registrada exitosamente.
        </p>
      </motion.div>
    );
  }

  const renderField = () => {
    const fieldName = currentQuestion.id as keyof SurveyFormData;
    const error = errors[fieldName];
    const selectedValues = getValues(fieldName as any) || [];

    switch (currentQuestion.type) {
      case 'text':
        return (
          <div>
            <input
              {...register(fieldName)}
              type="text"
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-black bg-white"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message?.toString()}</p>
            )}
          </div>
        );
      
      case 'tel':
        return (
          <div>
            <input
              {...register(fieldName)}
              type="tel"
              placeholder={currentQuestion.placeholder}
              maxLength={10}
              onKeyPress={(e) => {
                // Solo permitir números
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                // Filtrar solo números al pegar
                const pasteData = e.clipboardData.getData('text');
                const onlyNumbers = pasteData.replace(/\D/g, '');
                if (onlyNumbers !== pasteData) {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  const start = target.selectionStart || 0;
                  const end = target.selectionEnd || 0;
                  const currentValue = target.value;
                  const newValue = currentValue.substring(0, start) + onlyNumbers + currentValue.substring(end);
                  target.value = newValue.substring(0, 10);
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-black bg-white"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <select
              {...register(fieldName)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-black bg-white"
              autoFocus
            >
              <option value="">Selecciona una opción</option>
              {currentQuestion.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 cursor-pointer transition-colors bg-white"
              >
                <input
                  {...register(fieldName)}
                  type="radio"
                  value={option}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3 text-lg font-medium text-black">{option}</span>
              </label>
            ))}
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message?.toString()}</p>
            )}
          </div>
        );

      case 'checkbox':
        const showOtroField = Array.isArray(selectedValues) && selectedValues.includes('Otro');
        
        return (
          <div>
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 cursor-pointer transition-colors bg-white"
                >
                  <input
                    {...register(fieldName)}
                    type="checkbox"
                    value={option}
                    className="w-5 h-5 text-red-600 focus:ring-red-500 rounded"
                  />
                  <span className="ml-3 text-lg font-medium text-black">{option}</span>
                </label>
              ))}
            </div>
            
            {showOtroField && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <input
                  {...register('regalo_otro' as any)}
                  type="text"
                  placeholder="Especifica qué otro regalo..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg text-black bg-white"
                />
              </motion.div>
            )}
            
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message?.toString()}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-800 font-medium mb-2">
          <span>Pregunta {currentStep + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-red-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>
            {renderField()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>
          )}

          {currentStep < questions.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
            >
              Siguiente
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enviar Encuesta
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
