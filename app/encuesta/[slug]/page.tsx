'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import SurveyBot from '@/components/SurveyBot';
import type { SurveyFormData } from '@/lib/survey-config';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Survey } from '@/types/database';

export default function EncuestaSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // Fetch survey by slug
        const response = await fetch(`/api/surveys?slug=${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Encuesta no encontrada');
          } else {
            setError('Error al cargar la encuesta');
          }
          return;
        }

        const data = await response.json();
        const foundSurvey = data.survey;
        
        if (!foundSurvey) {
          setError('Encuesta no encontrada');
          return;
        }

        // Check if survey is active
        if (foundSurvey.status !== 'active') {
          setError('Esta encuesta no está disponible actualmente');
          return;
        }

        setSurvey(foundSurvey);
      } catch (err) {
        console.error('Error loading survey:', err);
        setError('Error al cargar la encuesta');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSurvey();
    }
  }, [slug]);

  const handleSurveyComplete = async (data: SurveyFormData) => {
    if (!survey) return;

    try {
      // Prepare survey data
      const surveyData: any = {
        nombre: data.nombre || '',
        telefono: data.telefono || '',
        regalo: data.regalo || [],
        regalo_otro: data.regalo_otro || null,
        lugar_compra: data.lugar_compra || '',
        gasto: data.gasto || '',
        respuestas: data, // Save all responses in JSON
        survey_id: survey.id, // Associate with survey
      };

      console.log('Sending survey data:', surveyData);

      const { data: result, error } = await supabaseBrowser
        .from('encuestas')
        .insert([surveyData])
        .select();

      if (error) {
        console.error('Error inserting survey:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(
          error.message || 
          error.details || 
          'Error desconocido al guardar la encuesta. Verifica la configuración de Supabase.'
        );
      }

      console.log('Survey saved successfully:', result);
    } catch (err) {
      console.error('Caught error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Cargando encuesta...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !survey) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error || 'Encuesta no encontrada'}
            </h1>
            <p className="text-gray-600 mb-8">
              La encuesta que buscas no existe o no está disponible en este momento.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
              {survey.title}
            </h1>
            {survey.description && (
              <p className="text-gray-600 text-lg">
                {survey.description}
              </p>
            )}
          </div>
        </div>

        {/* Survey Bot */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SurveyBot onComplete={handleSurveyComplete} surveyId={survey.id} />
        </div>
      </div>
    </main>
  );
}
