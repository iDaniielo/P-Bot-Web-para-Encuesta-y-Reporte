'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Loader2, FolderOpen, ClipboardList } from 'lucide-react';
import type { Survey, SurveyGroup } from '@/types/database';

interface SurveyWithGroup extends Survey {
  survey_groups?: SurveyGroup | null;
  questions_count?: number;
}

interface GroupedSurveys {
  [key: string]: SurveyWithGroup[];
}

export default function EncuestasPage() {
  const [surveys, setSurveys] = useState<SurveyWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys?status=active&includeCounts=true');
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

  // Group surveys by group
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

  // Get unique groups for filter
  const groups = useMemo(() => {
    return Object.keys(groupedSurveys).sort();
  }, [groupedSurveys]);

  // Filter surveys by selected group
  const filteredGroups = useMemo(() => {
    if (selectedGroup === 'all') {
      return groupedSurveys;
    }
    return { [selectedGroup]: groupedSurveys[selectedGroup] || [] };
  }, [selectedGroup, groupedSurveys]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              📋 Encuestas Disponibles
            </h1>
            <p className="text-xl text-gray-600">
              Selecciona una encuesta para comenzar a responder
            </p>
          </div>
        </div>

        {/* Filter by Group */}
        {groups.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por grupo:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las encuestas</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group} ({groupedSurveys[group].length})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Surveys List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Cargando encuestas...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                No hay encuestas activas
              </h2>
              <p className="text-gray-500 mb-6">
                En este momento no hay encuestas disponibles para responder.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al inicio
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(filteredGroups).map(([groupName, groupSurveys]) => (
                <div key={groupName}>
                  <div className="flex items-center gap-3 mb-4">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">{groupName}</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {groupSurveys.length} {groupSurveys.length === 1 ? 'encuesta' : 'encuestas'}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupSurveys.map((survey) => (
                      <Link
                        key={survey.id}
                        href={`/encuesta/${survey.slug}`}
                        className="group block bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {survey.title}
                          </h3>
                          {survey.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                              {survey.description}
                            </p>
                          )}
                        </div>

                        {/* Survey Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          {survey.questions_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <ClipboardList className="w-4 h-4" />
                              <span>{survey.questions_count} preguntas</span>
                            </div>
                          )}
                        </div>

                        {/* Call to Action */}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center text-blue-600 text-sm font-bold group-hover:translate-x-2 transition-transform">
                            Responder encuesta →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>¿Tienes dudas? Contacta al administrador del sistema</p>
        </div>
      </div>
    </main>
  );
}
