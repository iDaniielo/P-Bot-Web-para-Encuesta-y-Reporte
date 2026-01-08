'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, ShoppingBag, Users, ArrowLeft, Loader2, Gift, DollarSign, LogOut, Download, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { Encuesta } from '@/types/database';
import { exportToExcel } from '@/lib/excel-export';
import QuestionManager from '@/components/QuestionManager';

// Helper function to mask phone numbers (e.g., 5551234567 -> 55****4567)
const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone;
  const first2 = phone.substring(0, 2);
  const last4 = phone.substring(phone.length - 4);
  return `${first2}****${last4}`;
};

// Helper function to get the average from spending ranges
const getAverageFromRange = (range: string): number => {
  const match = range.match(/\$?(\d+)-?\$?(\d+)?/);
  if (!match) {
    if (range.toLowerCase().includes('menos')) return 250;
    if (range.toLowerCase().includes('más')) return 7500;
    return 0;
  }
  const low = parseInt(match[1]);
  const high = match[2] ? parseInt(match[2]) : low * 2;
  return (low + high) / 2;
};

export default function DashboardPage() {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions'>('dashboard');
  const itemsPerPage = 10;
  const { user, isAuthenticated, logout } = useAuth();

  const fetchEncuestas = async () => {
    try {
      // Solicitar datos completos (teléfonos sin enmascarar) para el dashboard
      const response = await fetch('/api/encuestas?full=true');
      const data = await response.json();
      
      // Handle error response or invalid data
      if (!response.ok || !Array.isArray(data)) {
        setEncuestas([]);
        return;
      }
      
      setEncuestas(data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setEncuestas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      // El middleware redirigirá automáticamente a /login si no hay token
      return;
    }
    fetchEncuestas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleExportExcel = () => {
    exportToExcel(encuestas, 'reporte-encuestas-navidad');
  };

  // Calculate KPIs
  const totalEncuestas = encuestas.length;

  // Top 3 Gifts by frequency - Handle arrays
  const giftCounts = encuestas.reduce((acc, curr) => {
    // Parse regalo if it's a string representation of an array
    let regalos: string[] = [];
    
    if (typeof curr.regalo === 'string') {
      try {
        // Try to parse if it looks like an array
        if (curr.regalo.startsWith('[')) {
          regalos = JSON.parse(curr.regalo);
        } else {
          regalos = [curr.regalo];
        }
      } catch {
        regalos = [curr.regalo];
      }
    } else if (Array.isArray(curr.regalo)) {
      regalos = curr.regalo;
    } else {
      regalos = [String(curr.regalo)];
    }
    
    // Count each gift individually
    regalos.forEach(regalo => {
      if (regalo === 'Otro' && curr.regalo_otro) {
        acc[curr.regalo_otro] = (acc[curr.regalo_otro] || 0) + 1;
      } else if (regalo !== 'Otro') {
        acc[regalo] = (acc[regalo] || 0) + 1;
      }
    });
    
    return acc;
  }, {} as Record<string, number>);

  const top3Gifts = Object.entries(giftCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Top 3 Shopping Places by frequency
  const placeCounts = encuestas.reduce((acc, curr) => {
    // Intentar obtener lugar_compra de la columna o de respuestas
    let lugar = curr.lugar_compra;
    if (!lugar || lugar === 'EMPTY') {
      if (curr.respuestas && typeof curr.respuestas === 'object') {
        const resp = curr.respuestas as any;
        lugar = resp.lugar_compra || resp.lugar || '';
      }
    }
    
    if (lugar && lugar !== 'EMPTY') {
      acc[lugar] = (acc[lugar] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const top3Places = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Average Spending
  const totalSpending = encuestas.reduce((sum, curr) => {
    // Intentar obtener gasto de la columna o de respuestas
    let gasto = curr.gasto;
    if (!gasto) {
      if (curr.respuestas && typeof curr.respuestas === 'object') {
        const resp = curr.respuestas as any;
        gasto = resp.gasto || '';
      }
    }
    return sum + (gasto ? getAverageFromRange(gasto) : 0);
  }, 0);
  const avgSpending = totalEncuestas > 0 ? totalSpending / totalEncuestas : 0;

  // Prepare data for budget distribution chart
  const gastoDistribution = encuestas.reduce((acc, curr) => {
    // Intentar obtener gasto de la columna o de respuestas
    let gasto = curr.gasto;
    if (!gasto) {
      if (curr.respuestas && typeof curr.respuestas === 'object') {
        const resp = curr.respuestas as any;
        gasto = resp.gasto || '';
      }
    }
    
    if (gasto) {
      acc[gasto] = (acc[gasto] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(gastoDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Pagination - Last 10 responses
  const sortedEncuestas = [...encuestas].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const totalPages = Math.ceil(sortedEncuestas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEncuestas = sortedEncuestas.slice(startIndex, endIndex);

  const COLORS = ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#9333ea'];

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
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportExcel}
                disabled={totalEncuestas === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Descargar Excel
              </button>
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
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Dashboard CEO
          </h1>
          <p className="text-gray-600">
            Métricas y análisis de respuestas de la encuesta navideña
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
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' ? (
          <>
            {/* KPI Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Responses */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Respuestas</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{totalEncuestas}</h3>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Average Spending */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Gasto Promedio</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  ${avgSpending.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h3>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Top Gift */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-sm font-medium">Regalo Más Popular</p>
                <h3 className="text-xl font-bold text-gray-900 mt-2 truncate">
                  {top3Gifts[0]?.[0] || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {top3Gifts[0]?.[1] || 0} respuestas
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-4">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Top Place */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-sm font-medium">Lugar Más Popular</p>
                <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">
                  {top3Places[0]?.[0] || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {top3Places[0]?.[1] || 0} respuestas
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-4">
                <ShoppingBag className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Lists */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top 3 Gifts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              Top 3 Regalos
            </h2>
            <div className="space-y-3">
              {top3Gifts.length > 0 ? (
                top3Gifts.map(([gift, count], index) => (
                  <div key={gift} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-2xl text-gray-400">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{gift}</span>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {count} votos
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>

          {/* Top 3 Places */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
              Top 3 Lugares de Compra
            </h2>
            <div className="space-y-3">
              {top3Places.length > 0 ? (
                top3Places.map(([place, count], index) => (
                  <div key={place} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-2xl text-gray-400">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{place}</span>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {count} votos
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Distribución del Presupuesto
            </h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No hay datos disponibles para mostrar
            </p>
          )}
        </div>

        {/* Recent Responses Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Últimas 10 Respuestas
          </h2>
          {currentEncuestas.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">Fecha</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Nombre</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Teléfono</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Regalo</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Lugar</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEncuestas.map((encuesta) => (
                      <tr key={encuesta.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(encuesta.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-900">{encuesta.nombre}</td>
                        <td className="p-3 text-sm text-gray-600 font-mono">
                          {maskPhone(encuesta.telefono)}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {(() => {
                            let regalos: string[] = [];
                            if (typeof encuesta.regalo === 'string') {
                              try {
                                if (encuesta.regalo.startsWith('[')) {
                                  regalos = JSON.parse(encuesta.regalo);
                                } else {
                                  regalos = [encuesta.regalo];
                                }
                              } catch {
                                regalos = [encuesta.regalo];
                              }
                            } else if (Array.isArray(encuesta.regalo)) {
                              regalos = encuesta.regalo;
                            } else {
                              regalos = [String(encuesta.regalo)];
                            }
                            
                            // Replace "Otro" with actual value if exists
                            const displayRegalos = regalos.map(r => 
                              r === 'Otro' && encuesta.regalo_otro ? encuesta.regalo_otro : r
                            );
                            
                            return displayRegalos.join(', ');
                          })()}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {(() => {
                            // Intentar obtener lugar_compra de la columna o de respuestas
                            let lugar = encuesta.lugar_compra;
                            if (!lugar || lugar === 'EMPTY') {
                              // Buscar en el campo respuestas
                              if (encuesta.respuestas && typeof encuesta.respuestas === 'object') {
                                const resp = encuesta.respuestas as any;
                                lugar = resp.lugar_compra || resp.lugar || '';
                              }
                            }
                            return lugar || 'N/A';
                          })()}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {(() => {
                            // Intentar obtener gasto de la columna o de respuestas
                            let gasto = encuesta.gasto;
                            if (!gasto) {
                              // Buscar en el campo respuestas
                              if (encuesta.respuestas && typeof encuesta.respuestas === 'object') {
                                const resp = encuesta.respuestas as any;
                                gasto = resp.gasto || '';
                              }
                            }
                            return gasto || 'N/A';
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No hay respuestas registradas aún
            </p>
          )}
        </div>
          </>
        ) : (
          <QuestionManager />
        )}
      </div>
    </main>
  );
}
