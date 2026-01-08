'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Music,
  Mic,
  X,
  Edit,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Evento, MenuEvento } from '@/types';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const TIPOS_EVENTO = [
  'Cumpleanos', 'Casamiento', 'Corporativo', 'Aniversario', 'Bautismo',
  'Comunion', 'Quince', 'Egresados', 'Otro'
];

const TURNOS = [
  { value: 'mediodia', label: 'Mediodia' },
  { value: 'noche', label: 'Noche' }
];

export default function EventosPage() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [menus, setMenus] = useState<MenuEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mesFilter, setMesFilter] = useState<number | ''>('');
  const [anioFilter, setAnioFilter] = useState(new Date().getFullYear());
  const [confirmadoFilter, setConfirmadoFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [formData, setFormData] = useState({
    fecha: '',
    cliente: '',
    telefono: '',
    turno: 'noche',
    hora_inicio: '',
    hora_fin: '',
    vendedor: '',
    tipo_evento: '',
    salon: '',
    menu_id: '',
    tecnica: false,
    dj: false,
    tecnica_superior: false,
    otros: '',
    adultos: 0,
    precio_adulto: 0,
    menores: 0,
    precio_menor: 0,
    extra1_descripcion: '',
    extra1_valor: 0,
    extra1_tipo: 'fijo',
    extra2_descripcion: '',
    extra2_valor: 0,
    extra2_tipo: 'fijo',
    extra3_descripcion: '',
    extra3_valor: 0,
    extra3_tipo: 'fijo',
    confirmado: false,
  });

  const fetchEventos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (mesFilter !== '') params.append('mes', mesFilter.toString());
      params.append('anio', anioFilter.toString());
      if (confirmadoFilter) params.append('confirmado', confirmadoFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/eventos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
    } finally {
      setLoading(false);
    }
  }, [mesFilter, anioFilter, confirmadoFilter, search]);

  const fetchMenus = async () => {
    try {
      const res = await fetch('/api/menus-evento');
      if (res.ok) {
        const data = await res.json();
        setMenus(data);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchMenus();
  }, [fetchEventos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingEvento
      ? `/api/eventos/${editingEvento.id}`
      : '/api/eventos';
    const method = editingEvento ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          menu_id: formData.menu_id ? parseInt(formData.menu_id) : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingEvento(null);
        resetForm();
        fetchEventos();
      }
    } catch (error) {
      console.error('Error saving evento:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este evento?')) return;

    try {
      const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEventos();
      }
    } catch (error) {
      console.error('Error deleting evento:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: '',
      cliente: '',
      telefono: '',
      turno: 'noche',
      hora_inicio: '',
      hora_fin: '',
      vendedor: '',
      tipo_evento: '',
      salon: '',
      menu_id: '',
      tecnica: false,
      dj: false,
      tecnica_superior: false,
      otros: '',
      adultos: 0,
      precio_adulto: 0,
      menores: 0,
      precio_menor: 0,
      extra1_descripcion: '',
      extra1_valor: 0,
      extra1_tipo: 'fijo',
      extra2_descripcion: '',
      extra2_valor: 0,
      extra2_tipo: 'fijo',
      extra3_descripcion: '',
      extra3_valor: 0,
      extra3_tipo: 'fijo',
      confirmado: false,
    });
  };

  const openEditModal = (evento: Evento) => {
    setEditingEvento(evento);
    setFormData({
      fecha: evento.fecha,
      cliente: evento.cliente,
      telefono: evento.telefono || '',
      turno: evento.turno,
      hora_inicio: evento.hora_inicio || '',
      hora_fin: evento.hora_fin || '',
      vendedor: evento.vendedor || '',
      tipo_evento: evento.tipo_evento || '',
      salon: evento.salon || '',
      menu_id: evento.menu_id?.toString() || '',
      tecnica: evento.tecnica,
      dj: evento.dj,
      tecnica_superior: evento.tecnica_superior,
      otros: evento.otros || '',
      adultos: evento.adultos,
      precio_adulto: evento.precio_adulto,
      menores: evento.menores,
      precio_menor: evento.precio_menor,
      extra1_descripcion: evento.extra1_descripcion || '',
      extra1_valor: evento.extra1_valor || 0,
      extra1_tipo: evento.extra1_tipo || 'fijo',
      extra2_descripcion: evento.extra2_descripcion || '',
      extra2_valor: evento.extra2_valor || 0,
      extra2_tipo: evento.extra2_tipo || 'fijo',
      extra3_descripcion: evento.extra3_descripcion || '',
      extra3_valor: evento.extra3_valor || 0,
      extra3_tipo: evento.extra3_tipo || 'fijo',
      confirmado: evento.confirmado,
    });
    setShowModal(true);
  };

  const calcularTotal = () => {
    let total = 0;
    total += formData.adultos * formData.precio_adulto;
    total += formData.menores * formData.precio_menor;

    const totalPersonas = formData.adultos + formData.menores;

    if (formData.extra1_valor) {
      total += formData.extra1_tipo === 'por_persona'
        ? formData.extra1_valor * totalPersonas
        : formData.extra1_valor;
    }
    if (formData.extra2_valor) {
      total += formData.extra2_tipo === 'por_persona'
        ? formData.extra2_valor * totalPersonas
        : formData.extra2_valor;
    }
    if (formData.extra3_valor) {
      total += formData.extra3_tipo === 'por_persona'
        ? formData.extra3_valor * totalPersonas
        : formData.extra3_valor;
    }

    return total;
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600">Gestiona tus eventos y cotizaciones</p>
          </div>

          {user.role !== 'viewer' && (
            <button
              onClick={() => {
                resetForm();
                setEditingEvento(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Evento
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente o telefono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Year filter */}
            <select
              value={anioFilter}
              onChange={(e) => setAnioFilter(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Month filter */}
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

            {/* Status filter */}
            <select
              value={confirmadoFilter}
              onChange={(e) => setConfirmadoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Todos</option>
              <option value="true">Confirmados</option>
              <option value="false">A confirmar</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando eventos...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
            <p className="text-gray-600">Crea tu primer evento para comenzar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow ${
                  evento.confirmado ? 'border-green-200' : 'border-amber-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
                      evento.confirmado ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <span className="text-xs font-medium text-gray-600">
                        {new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {new Date(evento.fecha + 'T00:00:00').getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{evento.cliente}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {evento.turno} {evento.hora_inicio && `- ${evento.hora_inicio}`}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-wrap gap-4 text-sm">
                    {evento.telefono && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {evento.telefono}
                      </div>
                    )}
                    {evento.salon && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {evento.salon}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {evento.adultos + evento.menores} personas
                    </div>
                    {evento.dj && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Music className="w-4 h-4" />
                        DJ
                      </div>
                    )}
                    {evento.tecnica && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Mic className="w-4 h-4" />
                        Tecnica
                      </div>
                    )}
                  </div>

                  {/* Status & Total */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(evento.total_evento)}
                      </div>
                      {evento.saldo_pendiente !== undefined && evento.saldo_pendiente > 0 && (
                        <div className="text-xs text-red-600">
                          Saldo: {formatCurrency(evento.saldo_pendiente)}
                        </div>
                      )}
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      evento.confirmado
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {evento.confirmado ? 'Confirmado' : 'A confirmar'}
                    </div>

                    {user.role !== 'viewer' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(evento)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(evento.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvento ? 'Editar Evento' : 'Nuevo Evento'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefono
                    </label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={formData.tipo_evento}
                      onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">Seleccionar...</option>
                      {TIPOS_EVENTO.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turno
                    </label>
                    <select
                      value={formData.turno}
                      onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {TURNOS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio
                    </label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fin
                    </label>
                    <input
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Venue & Vendor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salon
                    </label>
                    <input
                      type="text"
                      value={formData.salon}
                      onChange={(e) => setFormData({ ...formData, salon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendedor
                    </label>
                    <input
                      type="text"
                      value={formData.vendedor}
                      onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Menu
                    </label>
                    <select
                      value={formData.menu_id}
                      onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">Sin menu</option>
                      {menus.map(menu => (
                        <option key={menu.id} value={menu.id}>{menu.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicios Adicionales
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tecnica}
                        onChange={(e) => setFormData({ ...formData, tecnica: e.target.checked })}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">Tecnica</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dj}
                        onChange={(e) => setFormData({ ...formData, dj: e.target.checked })}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">DJ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tecnica_superior}
                        onChange={(e) => setFormData({ ...formData, tecnica_superior: e.target.checked })}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">Tecnica Superior</span>
                    </label>
                  </div>
                </div>

                {/* Guests & Pricing */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Invitados y Precios</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adultos
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.adultos}
                        onChange={(e) => setFormData({ ...formData, adultos: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Adulto
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.precio_adulto}
                        onChange={(e) => setFormData({ ...formData, precio_adulto: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Menores
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.menores}
                        onChange={(e) => setFormData({ ...formData, menores: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Menor
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.precio_menor}
                        onChange={(e) => setFormData({ ...formData, precio_menor: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Extras */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Extras</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder={`Extra ${n} descripcion`}
                          value={formData[`extra${n}_descripcion` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`extra${n}_descripcion`]: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <input
                          type="number"
                          placeholder="Valor"
                          min="0"
                          value={formData[`extra${n}_valor` as keyof typeof formData] as number || ''}
                          onChange={(e) => setFormData({ ...formData, [`extra${n}_valor`]: parseFloat(e.target.value) || 0 })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        <select
                          value={formData[`extra${n}_tipo` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`extra${n}_tipo`]: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="fijo">Monto fijo</option>
                          <option value="por_persona">Por persona</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Otros / Notas
                    </label>
                    <textarea
                      value={formData.otros}
                      onChange={(e) => setFormData({ ...formData, otros: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.confirmado}
                        onChange={(e) => setFormData({ ...formData, confirmado: e.target.checked })}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Evento Confirmado</span>
                    </label>

                    <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Evento</div>
                      <div className="text-2xl font-bold text-amber-700">
                        {formatCurrency(calcularTotal())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    {editingEvento ? 'Guardar Cambios' : 'Crear Evento'}
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
