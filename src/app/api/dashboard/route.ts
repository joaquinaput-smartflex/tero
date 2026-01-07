import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@/types';

interface DashboardData {
  stats: {
    total_insumos: number;
    total_recetas: number;
    total_platos: number;
    platos_con_alerta: number;
    insumos_sin_precio: number;
  };
  variaciones: Array<{
    id: number;
    nombre: string;
    precio_anterior: number;
    precio_actual: number;
    variacion_porcentaje: number;
  }>;
  alertas: Array<{
    id: number;
    nombre_carta: string;
    costo: number;
    precio_carta: number;
    margen_real: number;
    margen_objetivo: number;
    precio_sugerido: number;
  }>;
}

export async function GET() {
  try {
    // Get counts
    const [insumosCount] = await query<[{ count: number }]>(
      'SELECT COUNT(*) as count FROM insumos'
    );
    const [recetasCount] = await query<[{ count: number }]>(
      'SELECT COUNT(*) as count FROM recetas'
    );
    const [platosCount] = await query<[{ count: number }]>(
      'SELECT COUNT(*) as count FROM platos_carta WHERE activo = 1'
    );
    const [sinPrecioCount] = await query<[{ count: number }]>(
      `SELECT COUNT(*) as count FROM insumos i
       WHERE NOT EXISTS (SELECT 1 FROM precios p WHERE p.insumo_id = i.id)`
    );

    // Get price variations (last 14 days)
    const variaciones = await query<DashboardData['variaciones']>(`
      SELECT
        i.id,
        i.nombre,
        p_ant.precio as precio_anterior,
        p_act.precio as precio_actual,
        ROUND(((p_act.precio - p_ant.precio) / p_ant.precio) * 100, 1) as variacion_porcentaje
      FROM insumos i
      INNER JOIN (
        SELECT insumo_id, precio, fecha,
               ROW_NUMBER() OVER (PARTITION BY insumo_id ORDER BY fecha DESC) as rn
        FROM precios
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      ) p_act ON p_act.insumo_id = i.id AND p_act.rn = 1
      INNER JOIN (
        SELECT insumo_id, precio,
               ROW_NUMBER() OVER (PARTITION BY insumo_id ORDER BY fecha DESC) as rn
        FROM precios
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      ) p_ant ON p_ant.insumo_id = i.id AND p_ant.rn = 2
      WHERE ABS(((p_act.precio - p_ant.precio) / p_ant.precio) * 100) >= 5
      ORDER BY ABS(((p_act.precio - p_ant.precio) / p_ant.precio)) DESC
      LIMIT 10
    `);

    // Get margin alerts
    const alertas = await query<DashboardData['alertas']>(`
      SELECT
        p.id,
        p.nombre_carta,
        COALESCE((SELECT SUM(
          CASE
            WHEN ri.insumo_id IS NOT NULL THEN ri.cantidad * COALESCE(
              (SELECT costo_final FROM precios WHERE insumo_id = ri.insumo_id ORDER BY fecha DESC LIMIT 1), 0
            )
            ELSE 0
          END
        ) FROM receta_ingredientes ri WHERE ri.receta_id = p.receta_id), 0) as costo,
        p.precio_carta,
        p.margen_objetivo
      FROM platos_carta p
      WHERE p.activo = 1
      HAVING costo > 0 AND (p.precio_carta - costo) / p.precio_carta < p.margen_objetivo
      ORDER BY (p.precio_carta - costo) / p.precio_carta ASC
      LIMIT 10
    `);

    // Calculate margin and suggested price for alerts
    const alertasWithCalc = alertas.map((a) => ({
      ...a,
      margen_real: a.precio_carta > 0 ? (a.precio_carta - a.costo) / a.precio_carta : 0,
      precio_sugerido: a.costo / (1 - a.margen_objetivo),
    }));

    const stats = {
      total_insumos: insumosCount?.count || 0,
      total_recetas: recetasCount?.count || 0,
      total_platos: platosCount?.count || 0,
      platos_con_alerta: alertasWithCalc.length,
      insumos_sin_precio: sinPrecioCount?.count || 0,
    };

    return NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: {
        stats,
        variaciones,
        alertas: alertasWithCalc,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener dashboard',
    }, { status: 500 });
  }
}
