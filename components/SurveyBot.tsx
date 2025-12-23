'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { surveyQuestions, surveySchema, type SurveyFormData } from '@/lib/survey-config';

interface SurveyBotProps {
  onComplete: (data: SurveyFormData) => Promise<void>;
}

export default function SurveyBot({ onComplete }: SurveyBotProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    mode: 'onChange',
  });

  const currentQuestion = surveyQuestions[currentStep];
  const progress = ((currentStep + 1) / surveyQuestions.length) * 100;

  const handleNext = async () => {
    const fieldName = currentQuestion.id as keyof SurveyFormData;
    const isValid = await trigger(fieldName);

    if (isValid && currentStep < surveyQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      // TODO: Implement proper error handling with toast notifications
      // For production, consider using a library like react-hot-toast or sonner
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Hubo un error al enviar la encuesta: ${errorMessage}. Por favor intenta de nuevo.`);
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
        <p className="text-gray-600 mb-8">
          Tu respuesta ha sido registrada exitosamente.
        </p>
        <Link
          href="/"
          className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Volver al Inicio
        </Link>
      </motion.div>
    );
  }

  const renderField = () => {
    const fieldName = currentQuestion.id as keyof SurveyFormData;
    const error = errors[fieldName];

    switch (currentQuestion.type) {
      case 'text':
      case 'tel':
        return (
          <div>
            <input
              {...register(fieldName)}
              type={currentQuestion.type}
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <select
              {...register(fieldName)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
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
              <p className="mt-2 text-red-600 text-sm">{error.message}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 cursor-pointer transition-colors"
              >
                <input
                  {...register(fieldName)}
                  type="radio"
                  value={option}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <span className="ml-3 text-lg">{option}</span>
              </label>
            ))}
            {error && (
              <p className="mt-2 text-red-600 text-sm">{error.message}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Pregunta {currentStep + 1} de {surveyQuestions.length}</span>
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
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>
          )}

          {currentStep < surveyQuestions.length - 1 ? (
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
