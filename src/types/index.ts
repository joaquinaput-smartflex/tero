// ==========================================
// Tipos para Gastro Cost System (Tero)
// ==========================================

// Categorías de insumos
export interface Categoria {
  id: number;
  nombre: string;
  orden: number;
  created_at: Date;
}

// Proveedores
export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  activo: boolean;
  created_at: Date;
}

// Insumos (ingredientes)
export interface Insumo {
  id: number;
  nombre: string;
  categoria_id: number;
  proveedor_id?: number;
  unidad_medida: string;
  medida_compra?: string;
  iva_porcentaje: number;
  merma_porcentaje: number;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  categoria_nombre?: string;
  proveedor_nombre?: string;
  ultimo_precio?: number;
  costo_final?: number;
  variacion_porcentaje?: number;
}

// Precios históricos
export interface Precio {
  id: number;
  insumo_id: number;
  precio: number;
  fecha: Date;
  precio_unitario?: number;
  costo_con_iva?: number;
  costo_final?: number;
}

// Recetas
export interface Receta {
  id: number;
  nombre: string;
  es_subreceta: boolean;
  descripcion?: string;
  created_at: Date;
  updated_at: Date;
  // Calculated
  costo_total?: number;
  ingredientes?: RecetaIngrediente[];
}

// Ingredientes de receta
export interface RecetaIngrediente {
  id: number;
  receta_id: number;
  insumo_id?: number;
  subreceta_id?: number;
  cantidad: number;
  extra?: string;
  // Joined
  nombre?: string;
  unidad?: string;
  costo_unitario?: number;
  costo_total?: number;
  porcentaje?: number;
}

// Secciones de carta
export interface SeccionCarta {
  id: number;
  nombre: string;
  orden: number;
}

// Platos de carta
export interface PlatoCarta {
  id: number;
  receta_id: number;
  seccion_id: number;
  numero?: number;
  nombre_carta: string;
  precio_carta: number;
  margen_objetivo: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Calculated
  receta_nombre?: string;
  seccion_nombre?: string;
  costo?: number;
  margen_real?: number;
  estado?: 'OK' | 'ALERTA' | 'CRITICO';
  precio_sugerido?: number;
}

// Usuarios
export interface User {
  id: number;
  username: string;
  email: string | null;
  nombre: string | null;
  role: 'admin' | 'chef' | 'viewer';
  activo: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Stats for dashboard
export interface DashboardStats {
  total_insumos: number;
  total_recetas: number;
  total_platos: number;
  platos_con_alerta: number;
  insumos_sin_precio: number;
  variaciones_precio: InsumoVariacion[];
}

export interface InsumoVariacion {
  id: number;
  nombre: string;
  precio_anterior: number;
  precio_actual: number;
  variacion_porcentaje: number;
  fecha: Date;
}

// ==========================================
// Tipos para Modulo de Eventos
// ==========================================

// Menu predefinido para eventos
export interface MenuEvento {
  id: number;
  nombre: string;
  tipo: 'tapeo' | 'asado' | '3pasos' | 'premium' | 'brunch' | 'standard';
  categorias: MenuCategoria[];
  extras: string[];
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MenuCategoria {
  nombre: string;
  items: string[];
}

// Evento principal
export interface Evento {
  id: number;
  fecha: string; // DATE as string YYYY-MM-DD
  cliente: string;
  telefono?: string;
  turno: 'mediodia' | 'noche';
  hora_inicio?: string;
  hora_fin?: string;
  vendedor?: string;
  tipo_evento?: string;
  salon?: string;
  menu_id?: number;
  menu_detalle?: Record<string, unknown>;
  tecnica: boolean;
  dj: boolean;
  tecnica_superior: boolean;
  otros?: string;
  adultos: number;
  precio_adulto: number;
  menores: number;
  precio_menor: number;
  extra1_descripcion?: string;
  extra1_valor?: number;
  extra1_tipo?: 'fijo' | 'por_persona';
  extra2_descripcion?: string;
  extra2_valor?: number;
  extra2_tipo?: 'fijo' | 'por_persona';
  extra3_descripcion?: string;
  extra3_valor?: number;
  extra3_tipo?: 'fijo' | 'por_persona';
  total_evento: number;
  confirmado: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  menu_nombre?: string;
  total_pagado?: number;
  total_senas?: number;
  ajuste_ipc?: number;
  saldo_pendiente?: number;
}

// Pago de evento
export interface PagoEvento {
  id: number;
  evento_id: number;
  fecha: string;
  monto: number;
  concepto: 'pago' | 'sena' | 'ajuste_ipc';
  observaciones?: string;
  created_at: Date;
  // Joined
  cliente?: string;
  fecha_evento?: string;
}

// Stats del dashboard de eventos
export interface EventosDashboardStats {
  total_eventos: number;
  eventos_confirmados: number;
  facturacion_total: number;
  total_invitados: number;
  promedio_por_evento: number;
  total_cobrado: number;
  saldo_pendiente: number;
  eventos_por_mes: { mes: string; cantidad: number; facturacion: number }[];
  eventos_por_vendedor: { vendedor: string; cantidad: number; facturacion: number }[];
  eventos_por_tipo: { tipo: string; cantidad: number }[];
}
