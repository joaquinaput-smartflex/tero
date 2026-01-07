'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import type { Insumo, Categoria, Proveedor } from '@/types';

export default function CostosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [proveedorFilter, setProveedorFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [search, categoriaFilter, proveedorFilter]);

  async function fetchData() {
    try {
      const [catRes, provRes] = await Promise.all([
        fetch('/tero/api/categorias'),
        fetch('/tero/api/proveedores'),
      ]);

      const catData = await catRes.json();
      const provData = await provRes.json();

      if (catData.success) setCategorias(catData.data);
      if (provData.success) setProveedores(provData.data);

      await fetchInsumos();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function fetchInsumos() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoriaFilter) params.set('categoria_id', categoriaFilter);
      if (proveedorFilter) params.set('proveedor_id', proveedorFilter);

      const res = await fetch(`/tero/api/insumos?${params}`);
      const data = await res.json();

      if (data.success) {
        setInsumos(data.data);
      }
    } catch (error) {
      console.error('Error fetching insumos:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Costos de Insumos</h1>
          <p className="text-gray-600 mt-1">
            Gestión de precios de ingredientes y materias primas
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Insumo
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
              placeholder="Buscar insumo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Provider filter */}
          <select
            value={proveedorFilter}
            onChange={(e) => setProveedorFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insumo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Final
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : insumos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron insumos
                  </td>
                </tr>
              ) : (
                insumos.map((insumo) => (
                  <tr key={insumo.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {insumo.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {insumo.unidad_medida}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {insumo.categoria_nombre || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {insumo.proveedor_nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(insumo.ultimo_precio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(insumo.costo_final)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {insumo.variacion_porcentaje !== null && insumo.variacion_porcentaje !== undefined ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            insumo.variacion_porcentaje > 0
                              ? 'text-red-600'
                              : insumo.variacion_porcentaje < 0
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {insumo.variacion_porcentaje > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : insumo.variacion_porcentaje < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : null}
                          {insumo.variacion_porcentaje > 0 ? '+' : ''}
                          {insumo.variacion_porcentaje.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
