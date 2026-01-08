'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import DynamicDashboard from '@/components/DynamicDashboard';

export default function SurveyDashboardPage({ 
  params 
}: { 
  params: { surveyId: string } 
}) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to be checked
    if (isAuthenticated !== null) {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al dashboard principal
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Dashboard de Encuesta
          </h1>
        </div>

        {/* Dynamic Dashboard Component */}
        <DynamicDashboard surveyId={params.surveyId} />
      </div>
    </main>
  );
}
