'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, ChefHat, Link2 } from 'lucide-react';
import type { Receta } from '@/types';

export default function RecetasPage() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'all' | 'plato' | 'subreceta'>('all');

  useEffect(() => {
    fetchRecetas();
  }, [search, tipoFilter]);

  async function fetchRecetas() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tipoFilter !== 'all') params.set('es_subreceta', tipoFilter === 'subreceta' ? 'true' : 'false');

      const res = await fetch(`/tero/api/recetas?${params}`);
      const data = await res.json();

      if (data.success) {
        setRecetas(data.data);
      }
    } catch (error) {
      console.error('Error fetching recetas:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Recetas</h1>
          <p className="text-gray-600 mt-1">
            Gestión de recetas y subrecetas con cálculo automático de costos
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-5 h-5" />
          Nueva Receta
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
              placeholder="Buscar receta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTipoFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipoFilter === 'all'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTipoFilter('plato')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipoFilter === 'plato'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChefHat className="w-4 h-4 inline mr-1" />
              Platos
            </button>
            <button
              onClick={() => setTipoFilter('subreceta')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tipoFilter === 'subreceta'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-1" />
              Subrecetas
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Cargando...
          </div>
        ) : recetas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron recetas
          </div>
        ) : (
          recetas.map((receta) => (
            <div
              key={receta.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {receta.nombre}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${
                      receta.es_subreceta
                        ? 'text-purple-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {receta.es_subreceta ? (
                      <>
                        <Link2 className="w-3 h-3" />
                        Subreceta
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-3 h-3" />
                        Plato
                      </>
                    )}
                  </span>
                </div>
              </div>

              {receta.descripcion && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {receta.descripcion}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {receta.ingredientes?.length || 0} ingredientes
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(receta.costo_total)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
