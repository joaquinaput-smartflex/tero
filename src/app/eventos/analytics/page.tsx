'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  Target,
  Wallet,
} from 'lucide-react';
import { EventosDashboardStats, Evento } from '@/types';

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EventosDashboardStats | null>(null);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/eventos/stats?anio=${anio}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [anio]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-AR').format(value);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Resumen y estadisticas de eventos</p>
          </div>

          <select
            value={anio}
            onChange={(e) => setAnio(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : stats ? (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Eventos</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total_eventos}</div>
                    <div className="text-xs text-green-600">
                      {stats.eventos_confirmados} confirmados
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Facturacion</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.facturacion_total)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Invitados</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.total_invitados)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Promedio/Evento</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.promedio_por_evento)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Cobrado</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.total_cobrado)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Saldo Pendiente</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(stats.saldo_pendiente)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Revenue */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Facturacion Mensual
                </h3>
                <div className="space-y-3">
                  {stats.eventos_por_mes?.map((item) => {
                    const maxFact = Math.max(...stats.eventos_por_mes.map(i => i.facturacion));
                    const width = maxFact > 0 ? (item.facturacion / maxFact) * 100 : 0;
                    const mes = item.mes.split('-')[1];
                    const mesIdx = parseInt(mes) - 1;

                    return (
                      <div key={item.mes} className="flex items-center gap-3">
                        <div className="w-12 text-sm text-gray-600">{MESES[mesIdx]}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <div className="w-24 text-right text-sm font-medium text-gray-700">
                          {formatCurrency(item.facturacion)}
                        </div>
                        <div className="w-8 text-right text-xs text-gray-500">
                          ({item.cantidad})
                        </div>
                      </div>
                    );
                  })}
                  {(!stats.eventos_por_mes || stats.eventos_por_mes.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Sin datos para mostrar</p>
                  )}
                </div>
              </div>

              {/* By Vendor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Por Vendedor
                </h3>
                <div className="space-y-3">
                  {stats.eventos_por_vendedor?.map((item) => {
                    const maxFact = Math.max(...stats.eventos_por_vendedor.map(i => i.facturacion));
                    const width = maxFact > 0 ? (item.facturacion / maxFact) * 100 : 0;

                    return (
                      <div key={item.vendedor} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600 truncate">{item.vendedor}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <div className="w-24 text-right text-sm font-medium text-gray-700">
                          {formatCurrency(item.facturacion)}
                        </div>
                        <div className="w-8 text-right text-xs text-gray-500">
                          ({item.cantidad})
                        </div>
                      </div>
                    );
                  })}
                  {(!stats.eventos_por_vendedor || stats.eventos_por_vendedor.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Sin datos para mostrar</p>
                  )}
                </div>
              </div>
            </div>

            {/* Event Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Tipo de Evento</h3>
                <div className="flex flex-wrap gap-3">
                  {stats.eventos_por_tipo?.map((item) => (
                    <div
                      key={item.tipo}
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm"
                    >
                      <span className="font-medium text-gray-900">{item.tipo}</span>
                      <span className="ml-2 text-gray-500">({item.cantidad})</span>
                    </div>
                  ))}
                  {(!stats.eventos_por_tipo || stats.eventos_por_tipo.length === 0) && (
                    <p className="text-gray-500">Sin datos para mostrar</p>
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Proximos Eventos
                </h3>
                <div className="space-y-3">
                  {(stats as EventosDashboardStats & { proximos_eventos?: Evento[] }).proximos_eventos?.slice(0, 5).map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex flex-col items-center justify-center text-xs">
                          <span className="font-bold">
                            {new Date(evento.fecha + 'T00:00:00').getDate()}
                          </span>
                          <span className="text-gray-600">
                            {MESES[new Date(evento.fecha + 'T00:00:00').getMonth()]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{evento.cliente}</div>
                          <div className="text-xs text-gray-500">
                            {evento.adultos + evento.menores} personas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(evento.total_evento)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!(stats as EventosDashboardStats & { proximos_eventos?: Evento[] }).proximos_eventos ||
                    (stats as EventosDashboardStats & { proximos_eventos?: Evento[] }).proximos_eventos?.length === 0) && (
                    <p className="text-gray-500 text-center py-4">Sin eventos proximos</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No se pudieron cargar las estadisticas
          </div>
        )}
      </main>
    </div>
  );
}
