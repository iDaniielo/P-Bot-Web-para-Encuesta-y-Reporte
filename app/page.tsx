'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import { Gift, BarChart3, FileText, FolderOpen, Loader2 } from "lucide-react";
import type { Survey, SurveyGroup } from '@/types/database';

interface SurveyWithGroup extends Survey {
  survey_groups?: SurveyGroup | null;
}

interface GroupedSurveys {
  [key: string]: SurveyWithGroup[];
}

export default function Home() {
  const [surveys, setSurveys] = useState<SurveyWithGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys?status=active');
        if (response.ok) {
          const data = await response.json();
          setSurveys(data.surveys || []);
        }
      } catch (error) {
        console.error('Error loading surveys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  // Group surveys by group (memoized for performance)
  const groupedSurveys: GroupedSurveys = useMemo(() => {
    return surveys.reduce((acc, survey) => {
      const groupName = survey.survey_groups?.name || 'Sin grupo';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(survey);
      return acc;
    }, {} as GroupedSurveys);
  }, [surveys]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎄 Sistema de Encuestas
          </h1>
          <p className="text-xl text-gray-600">
            Selecciona una encuesta para comenzar o accede al dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Dashboard Card */}
          <Link
            href="/dashboard"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Dashboard CEO
              </h2>
              <p className="text-gray-600">
                Visualiza métricas y análisis de las respuestas recopiladas
              </p>
              <span className="inline-block text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                Ver Dashboard →
              </span>
            </div>
          </Link>

          {/* Legacy Survey Link (default) */}
          <Link
            href="/encuesta"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-red-500"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Encuesta Navideña 2024
              </h2>
              <p className="text-gray-600">
                Cuéntanos sobre tus planes de regalos navideños
              </p>
              <span className="inline-block text-red-600 font-semibold group-hover:translate-x-2 transition-transform">
                Comenzar →
              </span>
            </div>
          </Link>
        </div>

        {/* Available Surveys Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Encuestas Disponibles
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Cargando encuestas...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay encuestas activas disponibles</p>
              <p className="text-gray-400 text-sm mt-2">
                Los administradores pueden crear nuevas encuestas desde el dashboard
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSurveys).map(([groupName, groupSurveys]) => (
                <div key={groupName}>
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="w-5 h-5 text-gray-500" />
                    <h3 className="text-xl font-semibold text-gray-700">{groupName}</h3>
                    <span className="text-sm text-gray-500">({groupSurveys.length})</span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupSurveys.map((survey) => (
                      <Link
                        key={survey.id}
                        href={`/encuesta?surveyId=${survey.id}`}
                        className="group block bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-transparent hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {survey.title}
                        </h4>
                        {survey.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {survey.description}
                          </p>
                        )}
                        <span className="inline-flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                          Comenzar encuesta →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2024-2025 Sistema de Encuestas. Hecho con ❤️</p>
        </footer>
      </div>
    </main>
  );
}
