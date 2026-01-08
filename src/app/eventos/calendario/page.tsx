'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { Evento } from '@/types';
import Link from 'next/link';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  eventos: Evento[];
}

export default function CalendarioPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const fetchEventos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('anio', currentDate.getFullYear().toString());

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
  }, [currentDate]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const dayEventos = eventos.filter(e => e.fecha === dateStr);

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        eventos: dayEventos,
      });
    }

    return days;
  }, [currentDate, eventos]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-gray-600">Vista mensual de eventos</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoy
            </button>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="ml-4 text-lg font-semibold text-gray-900">
              {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DIAS_SEMANA.map(dia => (
              <div
                key={dia}
                className="py-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                onClick={() => day.eventos.length > 0 && setSelectedDay(day)}
                className={`
                  min-h-[100px] p-2 border-b border-r border-gray-100 transition-colors
                  ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                  ${day.isToday ? 'bg-amber-50' : ''}
                  ${day.eventos.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}
                `}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${day.isToday ? 'text-amber-600' : ''}
                `}>
                  {day.date.getDate()}
                </div>

                {/* Event indicators */}
                <div className="space-y-1">
                  {day.eventos.slice(0, 3).map((evento, i) => (
                    <div
                      key={evento.id}
                      className={`
                        text-xs px-2 py-1 rounded truncate
                        ${evento.confirmado
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                        }
                      `}
                    >
                      {evento.cliente}
                    </div>
                  ))}
                  {day.eventos.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{day.eventos.length - 3} mas
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm text-gray-600">Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div>
            <span className="text-sm text-gray-600">A confirmar</span>
          </div>
        </div>

        {/* Selected Day Modal */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedDay.date.toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedDay.eventos.length} evento(s)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedDay.eventos.map(evento => (
                  <Link
                    key={evento.id}
                    href={`/eventos?edit=${evento.id}`}
                    className={`
                      block p-4 rounded-lg border-2 hover:shadow-md transition-all
                      ${evento.confirmado
                        ? 'border-green-200 bg-green-50'
                        : 'border-amber-200 bg-amber-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{evento.cliente}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {evento.turno}
                          {evento.hora_inicio && ` - ${evento.hora_inicio}`}
                        </div>
                      </div>
                      {evento.confirmado ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {evento.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {evento.telefono}
                        </span>
                      )}
                      {evento.salon && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {evento.salon}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {evento.adultos + evento.menores} personas
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {evento.tipo_evento || 'Sin tipo'}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(evento.total_evento)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
