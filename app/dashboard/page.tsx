'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import QuestionManager from '@/components/QuestionManager';
import FAQChat from '@/components/FAQChat';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions'>('dashboard');
  const [surveys, setSurveys] = useState<any[]>([]);
  const { user, isAuthenticated, logout } = useAuth();

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys?status=active');
      const data = await response.json();
      
      if (response.ok && data.surveys) {
        setSurveys(data.surveys);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      // El middleware redirigirá automáticamente a /login si no hay token
      return;
    }
    fetchSurveys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cerrando sesión...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </>
              )}
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Dashboard CEO
          </h1>
          <p className="text-gray-600">
            Accede a los dashboards de las encuestas activas o gestiona las preguntas
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Conectado como: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'questions'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Gestión de Preguntas
            </button>
            <Link
              href="/dashboard/surveys"
              className="pb-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors flex items-center gap-2"
            >
              📋 Gestión de Encuestas
            </Link>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' ? (
          <>
            {/* Survey Selector for Dynamic Dashboards */}
            {surveys.length > 0 ? (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📊 Dashboards Dinámicos por Encuesta
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona una encuesta para ver estadísticas detalladas con gráficos dinámicos
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {surveys.map((survey) => (
                    <Link
                      key={survey.id}
                      href={`/dashboard/${survey.id}`}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all group"
                    >
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                        {survey.title}
                      </h4>
                      {survey.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>/{survey.slug}</span>
                        <span className="text-purple-600 group-hover:text-purple-700 font-medium">
                          Ver dashboard →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                <p className="text-gray-600 mb-2">No hay encuestas activas disponibles</p>
                <p className="text-sm text-gray-500">
                  Ve a{' '}
                  <Link href="/dashboard/surveys" className="text-purple-600 hover:text-purple-700 font-medium">
                    Gestión de Encuestas
                  </Link>
                  {' '}para crear una nueva encuesta.
                </p>
              </div>
            )}
          </>
        ) : (
          <QuestionManager />
        )}
      </div>

      {/* FAQ Chat - Only visible in CEO Dashboard */}
      <FAQChat />
    </main>
  );
}
