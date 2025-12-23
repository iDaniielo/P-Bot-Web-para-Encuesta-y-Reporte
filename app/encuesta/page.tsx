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
  );
}
