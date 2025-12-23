'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Users, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Encuesta } from '@/types/database';

export default function DashboardPage() {
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEncuestas();
  }, []);

  const fetchEncuestas = async () => {
    try {
      const response = await fetch('/api/encuestas');
      const data = await response.json();
      setEncuestas(data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      // TODO: Implement proper error UI with error boundaries
      // For production, show user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalEncuestas = encuestas.length;

  const topLugar = encuestas.reduce((acc, curr) => {
    acc[curr.lugar_compra] = (acc[curr.lugar_compra] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLugarCompra = Object.entries(topLugar).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Prepare data for budget distribution chart
  const gastoDistribution = encuestas.reduce((acc, curr) => {
    acc[curr.gasto] = (acc[curr.gasto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(gastoDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Pagination
  const totalPages = Math.ceil(totalEncuestas / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEncuestas = encuestas.slice(startIndex, endIndex);

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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Dashboard CEO
          </h1>
          <p className="text-gray-600">
            Métricas y análisis de respuestas de la encuesta navideña
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Encuestas</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{totalEncuestas}</h3>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Top Lugar de Compra</p>
                <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2">
                  {topLugarCompra}
                </h3>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <ShoppingBag className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Distribución del Presupuesto
            </h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
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
            Respuestas Recientes
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
                          {new Date(encuesta.created_at).toLocaleDateString('es-MX')}
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-900">{encuesta.nombre}</td>
                        <td className="p-3 text-sm text-gray-600">{encuesta.telefono}</td>
                        <td className="p-3 text-sm text-gray-600">{encuesta.regalo}</td>
                        <td className="p-3 text-sm text-gray-600">{encuesta.lugar_compra}</td>
                        <td className="p-3 text-sm text-gray-600">{encuesta.gasto}</td>
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
      </div>
    </main>
  );
}
