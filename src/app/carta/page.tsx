'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import type { PlatoCarta, SeccionCarta } from '@/types';

export default function CartaPage() {
  const [platos, setPlatos] = useState<PlatoCarta[]>([]);
  const [secciones, setSecciones] = useState<SeccionCarta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seccionFilter, setSeccionFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPlatos();
  }, [search, seccionFilter]);

  async function fetchData() {
    try {
      const secRes = await fetch('/tero/api/secciones');
      const secData = await secRes.json();
      if (secData.success) setSecciones(secData.data);
      await fetchPlatos();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function fetchPlatos() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (seccionFilter) params.set('seccion_id', seccionFilter);

      const res = await fetch(`/tero/api/platos?${params}`);
      const data = await res.json();

      if (data.success) {
        setPlatos(data.data);
      }
    } catch (error) {
      console.error('Error fetching platos:', error);
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

  function getEstadoBadge(estado: string | undefined) {
    switch (estado) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            OK
          </span>
        );
      case 'ALERTA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3 h-3" />
            Alerta
          </span>
        );
      case 'CRITICO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            Crítico
          </span>
        );
      default:
        return null;
    }
  }

  // Group by section
  const platosBySeccion = platos.reduce((acc, plato) => {
    const seccion = plato.seccion_nombre || 'Sin Sección';
    if (!acc[seccion]) acc[seccion] = [];
    acc[seccion].push(plato);
    return acc;
  }, {} as Record<string, PlatoCarta[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carta</h1>
          <p className="text-gray-600 mt-1">
            Gestión del menú con control de márgenes y precios
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Agregar Plato
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar plato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Section filter */}
          <select
            value={seccionFilter}
            onChange={(e) => setSeccionFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las secciones</option>
            {secciones.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : Object.keys(platosBySeccion).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron platos
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(platosBySeccion).map(([seccion, platosSeccion]) => (
            <div key={seccion}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {seccion}
                <span className="text-sm font-normal text-gray-500">
                  ({platosSeccion.length})
                </span>
              </h2>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Plato
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Costo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Margen
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {platosSeccion.map((plato) => (
                      <tr key={plato.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {plato.numero || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {plato.nombre_carta}
                          </div>
                          <div className="text-sm text-gray-500">
                            {plato.receta_nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {formatCurrency(plato.costo)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                          {formatCurrency(plato.precio_carta)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-sm font-medium ${
                                (plato.margen_real || 0) >= plato.margen_objetivo
                                  ? 'text-green-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {((plato.margen_real || 0) * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-400">
                              obj: {(plato.margen_objetivo * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getEstadoBadge(plato.estado)}
                          {plato.precio_sugerido && plato.estado !== 'OK' && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Sug: {formatCurrency(plato.precio_sugerido)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
