'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ChefHat,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface DashboardStats {
  total_insumos: number;
  total_recetas: number;
  total_platos: number;
  platos_con_alerta: number;
  insumos_sin_precio: number;
}

interface Variacion {
  id: number;
  nombre: string;
  precio_anterior: number;
  precio_actual: number;
  variacion_porcentaje: number;
}

interface AlertaMargen {
  id: number;
  nombre_carta: string;
  costo: number;
  precio_carta: number;
  margen_real: number;
  margen_objetivo: number;
  precio_sugerido: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [variaciones, setVariaciones] = useState<Variacion[]>([]);
  const [alertas, setAlertas] = useState<AlertaMargen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/tero/api/dashboard');
      const data = await res.json();

      if (data.success) {
        setStats(data.data.stats);
        setVariaciones(data.data.variaciones || []);
        setAlertas(data.data.alertas || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number | undefined | null) {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Resumen de costos, márgenes y alertas del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_insumos || 0}
              </div>
              <div className="text-sm text-gray-500">Insumos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_recetas || 0}
              </div>
              <div className="text-sm text-gray-500">Recetas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.total_platos || 0}
              </div>
              <div className="text-sm text-gray-500">Platos en Carta</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {stats?.platos_con_alerta || 0}
              </div>
              <div className="text-sm text-gray-500">Alertas de Margen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Variations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Margin Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Platos con Margen Bajo
            </h2>
          </div>
          <div className="p-6">
            {alertas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay alertas de margen
              </p>
            ) : (
              <div className="space-y-4">
                {alertas.slice(0, 5).map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {alerta.nombre_carta}
                      </div>
                      <div className="text-sm text-gray-600">
                        Margen: {((alerta.margen_real || 0) * 100).toFixed(0)}% (obj:{' '}
                        {(alerta.margen_objetivo * 100).toFixed(0)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Precio sugerido</div>
                      <div className="font-semibold text-amber-700">
                        {formatCurrency(alerta.precio_sugerido)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price Variations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Variaciones de Precio (últimos 14 días)
            </h2>
          </div>
          <div className="p-6">
            {variaciones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay variaciones significativas
              </p>
            ) : (
              <div className="space-y-4">
                {variaciones.slice(0, 5).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{v.nombre}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(v.precio_anterior)} → {formatCurrency(v.precio_actual)}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        v.variacion_porcentaje > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {v.variacion_porcentaje > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {v.variacion_porcentaje > 0 ? '+' : ''}
                      {v.variacion_porcentaje.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
