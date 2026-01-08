'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import SurveyManager from '@/components/SurveyManager';

export default function SurveysManagementPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to be checked
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
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
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al dashboard
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
            📋 Gestión de Encuestas
          </h1>
          <p className="text-gray-600">
            Crea, edita y administra las encuestas del sistema
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Conectado como: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        {/* Survey Manager Component */}
        <SurveyManager />
      </div>
    </main>
  );
}
