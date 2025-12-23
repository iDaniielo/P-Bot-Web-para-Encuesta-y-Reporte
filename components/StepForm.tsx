'use client';

import { useState } from 'react';
import { FormField, SurveyResponse } from '@/lib/types';

interface StepFormProps {
  fields: FormField[];
  onSubmit: (data: Omit<SurveyResponse, 'id' | 'created_at'>) => Promise<void>;
  onSuccess?: () => void;
}

export default function StepForm({ fields, onSubmit, onSuccess }: StepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<SurveyResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentField = fields[currentStep];
  const isLastStep = currentStep === fields.length - 1;
  const progress = ((currentStep + 1) / fields.length) * 100;

  const handleNext = () => {
    const value = formData[currentField.name];
    
    if (currentField.required && (!value || value === '')) {
      setError('Este campo es obligatorio');
      return;
    }

    if (currentField.type === 'number' && value !== undefined) {
      const numValue = Number(value);
      if (currentField.min !== undefined && numValue < currentField.min) {
        setError(`El valor mínimo es ${currentField.min}`);
        return;
      }
      if (currentField.max !== undefined && numValue > currentField.max) {
        setError(`El valor máximo es ${currentField.max}`);
        return;
      }
    }

    setError(null);
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate all required fields are present
      const isValid = fields.every(field => {
        if (!field.required) return true;
        const value = formData[field.name];
        return value !== undefined && value !== '' && value !== null;
      });

      if (!isValid) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      await onSubmit(formData as Omit<SurveyResponse, 'id' | 'created_at'>);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la encuesta');
      setIsSubmitting(false);
    }
  };

  const handleChange = (value: string | number) => {
    let finalValue = value;
    
    // Si es el campo de teléfono, solo permitir números y máximo 10 dígitos
    if (currentField.name === 'telefono' && typeof value === 'string') {
      // Eliminar todo lo que no sea número
      finalValue = value.replace(/\D/g, '');
      // Limitar a 10 dígitos
      if (finalValue.length > 10) {
        finalValue = finalValue.slice(0, 10);
      }
    }
    
    setFormData({
      ...formData,
      [currentField.name]: currentField.type === 'number' ? Number(finalValue) : finalValue,
    });
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pregunta {currentStep + 1} de {fields.length}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {currentField.label}
        </h2>

        {currentField.type === 'select' && currentField.options ? (
          <div className="space-y-3">
            {currentField.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange(option)}
                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-200 ${
                  formData[currentField.name] === option
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        ) : (
          <input
            type={currentField.type}
            value={formData[currentField.name] || ''}
            onChange={(e) => handleChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentField.placeholder}
            min={currentField.min}
            max={currentField.max}
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white outline-none transition-all"
            autoFocus
          />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          ← Anterior
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : isLastStep ? (
            'Enviar encuesta'
          ) : (
            <>
              Siguiente →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
