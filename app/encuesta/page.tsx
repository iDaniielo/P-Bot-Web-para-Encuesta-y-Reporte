'use client';

import { supabase } from '@/lib/supabase';
import SurveyBot from '@/components/SurveyBot';
import type { SurveyFormData } from '@/lib/survey-config';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EncuestaPage() {
  const handleSurveyComplete = async (data: SurveyFormData) => {
    const { error } = await supabase
      .from('encuestas')
      .insert([
        {
          nombre: data.nombre,
          telefono: data.telefono,
          regalo: data.regalo,
          lugar_compra: data.lugar_compra,
          gasto: data.gasto,
        },
      ]);

    if (error) {
      // TODO: Implement proper error tracking (e.g., Sentry, LogRocket)
      console.error('Error inserting survey:', error);
      throw new Error(`Error al guardar la encuesta: ${error.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎁 Encuesta Navideña
            </h1>
            <p className="text-gray-600">
              Responde algunas preguntas sobre tus planes navideños
            </p>
          </div>
        </div>

        {/* Survey Bot */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SurveyBot onComplete={handleSurveyComplete} />
        </div>
      </div>
    </main>
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepForm from '@/components/StepForm';
import { surveyFields } from '@/lib/surveyConfig';
import { getSupabaseClient } from '@/lib/supabase';
import { SurveyResponse } from '@/lib/types';
import Link from 'next/link';

export default function EncuestaPage() {
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: Omit<SurveyResponse, 'id' | 'created_at'>) => {
    const client = getSupabaseClient();
    const { error } = await client
      .from('survey_responses')
      .insert([data]);

    if (error) {
      throw new Error('Error al guardar la encuesta: ' + error.message);
    }
  };

  const handleSuccess = () => {
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
            ✓
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Gracias!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Tu encuesta ha sido enviada exitosamente.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => setIsComplete(false)}
              className="block w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
            >
              Enviar otra respuesta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          ← Volver al inicio
        </Link>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Encuesta de Preferencias
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Responde las siguientes preguntas para ayudarnos a conocerte mejor
        </p>
      </div>

      <StepForm
        fields={surveyFields}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
