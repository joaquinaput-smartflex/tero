'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import {
  DollarSign,
  Calendar,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  TrendingUp,
  Wallet,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { Evento, PagoEvento } from '@/types';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CONCEPTOS = [
  { value: 'sena', label: 'Sena', color: 'bg-blue-100 text-blue-700' },
  { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-700' },
  { value: 'ajuste_ipc', label: 'Ajuste IPC', color: 'bg-purple-100 text-purple-700' },
];

export default function CobranzasPage() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesFilter, setMesFilter] = useState<number | ''>('');
  const [anioFilter, setAnioFilter] = useState(new Date().getFullYear());
  const [saldoFilter, setSaldoFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    concepto: 'pago',
    observaciones: '',
  });

  const fetchEventos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (mesFilter !== '') params.append('mes', mesFilter.toString());
      params.append('anio', anioFilter.toString());
      params.append('confirmado', 'true'); // Only confirmed events
      if (search) params.append('search', search);

      const res = await fetch(`/api/eventos?${params}`);
      if (res.ok) {
        let data = await res.json();

        // Filter by saldo
        if (saldoFilter === 'pendiente') {
          data = data.filter((e: Evento) => (e.saldo_pendiente || 0) > 0);
        } else if (saldoFilter === 'pagado') {
          data = data.filter((e: Evento) => (e.saldo_pendiente || 0) <= 0);
        }

        setEventos(data);
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
    } finally {
      setLoading(false);
    }
  }, [mesFilter, anioFilter, saldoFilter, search]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvento) return;

    try {
      const res = await fetch(`/api/eventos/${selectedEvento.id}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        setSelectedEvento(null);
        setPaymentForm({
          fecha: new Date().toISOString().split('T')[0],
          monto: 0,
          concepto: 'pago',
          observaciones: '',
        });
        fetchEventos();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleDeletePayment = async (pagoId: number) => {
    if (!confirm('Eliminar este pago?')) return;

    try {
      const res = await fetch(`/api/pagos/${pagoId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEventos();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Calculate totals
  const totals = eventos.reduce(
    (acc, e) => ({
      facturado: acc.facturado + e.total_evento,
      cobrado: acc.cobrado + (e.total_pagado || 0),
      pendiente: acc.pendiente + (e.saldo_pendiente || 0),
      senas: acc.senas + (e.total_senas || 0),
    }),
    { facturado: 0, cobrado: 0, pendiente: 0, senas: 0 }
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cobranzas</h1>
          <p className="text-gray-600">Control de pagos y saldos de eventos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Facturado</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(totals.facturado)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Cobrado</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(totals.cobrado)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Senas</div>
                <div className="text-xl font-bold text-amber-600">{formatCurrency(totals.senas)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Pendiente</div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(totals.pendiente)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <select
              value={anioFilter}
              onChange={(e) => setAnioFilter(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={mesFilter}
              onChange={(e) => setMesFilter(e.target.value ? parseInt(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Todos los meses</option>
              {MESES.map((mes, idx) => (
                <option key={idx} value={idx + 1}>{mes}</option>
              ))}
            </select>

            <select
              value={saldoFilter}
              onChange={(e) => setSaldoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Con saldo pendiente</option>
              <option value="pagado">Pagado completo</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin eventos</h3>
            <p className="text-gray-600">No hay eventos confirmados en este periodo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento) => {
              const porcentajeCobrado = evento.total_evento > 0
                ? ((evento.total_pagado || 0) / evento.total_evento) * 100
                : 0;

              return (
                <div
                  key={evento.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Event header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-xs text-gray-600">
                            {new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {new Date(evento.fecha + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{evento.cliente}</div>
                          <div className="text-sm text-gray-500">
                            {evento.tipo_evento || 'Evento'} - {evento.adultos + evento.menores} personas
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Facturado</div>
                          <div className="font-bold text-gray-900">{formatCurrency(evento.total_evento)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Cobrado</div>
                          <div className="font-bold text-green-600">{formatCurrency(evento.total_pagado || 0)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Saldo</div>
                          <div className={`font-bold ${(evento.saldo_pendiente || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(evento.saldo_pendiente || 0)}
                          </div>
                        </div>

                        {user.role !== 'viewer' && (
                          <button
                            onClick={() => {
                              setSelectedEvento(evento);
                              setShowPaymentModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Registrar Pago
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${Math.min(porcentajeCobrado, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {porcentajeCobrado.toFixed(0)}% cobrado
                      </div>
                    </div>
                  </div>

                  {/* Payments list - collapsible */}
                  {((evento as Evento & { pagos?: PagoEvento[] }).pagos?.length || 0) > 0 && (
                    <div className="px-4 py-3 bg-gray-50">
                      <div className="text-sm font-medium text-gray-700 mb-2">Historial de Pagos</div>
                      <div className="space-y-2">
                        {(evento as Evento & { pagos?: PagoEvento[] }).pagos?.map((pago: PagoEvento) => {
                          const concepto = CONCEPTOS.find(c => c.value === pago.concepto);
                          return (
                            <div
                              key={pago.id}
                              className="flex items-center justify-between bg-white rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded ${concepto?.color || 'bg-gray-100 text-gray-700'}`}>
                                  {concepto?.label || pago.concepto}
                                </span>
                                <span className="text-sm text-gray-600">{formatDate(pago.fecha)}</span>
                                {pago.observaciones && (
                                  <span className="text-sm text-gray-400">{pago.observaciones}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-900">{formatCurrency(pago.monto)}</span>
                                {user.role === 'admin' && (
                                  <button
                                    onClick={() => handleDeletePayment(pago.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedEvento && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
                  <p className="text-sm text-gray-600">{selectedEvento.cliente}</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                <div className="bg-amber-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Saldo pendiente:</span>
                    <span className="font-bold text-amber-700">
                      {formatCurrency(selectedEvento.saldo_pendiente || 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.fecha}
                    onChange={(e) => setPaymentForm({ ...paymentForm, fecha: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={paymentForm.monto || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, monto: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concepto
                  </label>
                  <select
                    value={paymentForm.concepto}
                    onChange={(e) => setPaymentForm({ ...paymentForm, concepto: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {CONCEPTOS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <input
                    type="text"
                    value={paymentForm.observaciones}
                    onChange={(e) => setPaymentForm({ ...paymentForm, observaciones: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
