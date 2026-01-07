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
