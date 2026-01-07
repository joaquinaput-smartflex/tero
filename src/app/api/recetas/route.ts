import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Receta, ApiResponse } from '@/types';

// GET /api/recetas - List all recipes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const es_subreceta = searchParams.get('es_subreceta');

    let sql = `
      SELECT r.*,
        (SELECT SUM(
          CASE
            WHEN ri.insumo_id IS NOT NULL THEN ri.cantidad * COALESCE(
              (SELECT costo_final FROM precios WHERE insumo_id = ri.insumo_id ORDER BY fecha DESC LIMIT 1), 0
            )
            WHEN ri.subreceta_id IS NOT NULL THEN ri.cantidad * COALESCE(
              (SELECT SUM(ri2.cantidad * COALESCE(
                (SELECT costo_final FROM precios WHERE insumo_id = ri2.insumo_id ORDER BY fecha DESC LIMIT 1), 0
              )) FROM receta_ingredientes ri2 WHERE ri2.receta_id = ri.subreceta_id), 0
            )
            ELSE 0
          END
        ) FROM receta_ingredientes ri WHERE ri.receta_id = r.id) as costo_total,
        (SELECT COUNT(*) FROM receta_ingredientes WHERE receta_id = r.id) as num_ingredientes
      FROM recetas r
      WHERE 1=1
    `;

    const params: (string | boolean)[] = [];

    if (search) {
      sql += ' AND r.nombre LIKE ?';
      params.push(`%${search}%`);
    }

    if (es_subreceta !== null) {
      sql += ' AND r.es_subreceta = ?';
      params.push(es_subreceta === 'true');
    }

    sql += ' ORDER BY r.es_subreceta, r.nombre';

    const recetas = await query<Receta[]>(sql, params);

    return NextResponse.json<ApiResponse<Receta[]>>({
      success: true,
      data: recetas,
    });
  } catch (error) {
    console.error('Error fetching recetas:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener recetas',
    }, { status: 500 });
  }
}

// POST /api/recetas - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, es_subreceta, descripcion } = body;

    if (!nombre) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'El nombre es requerido',
      }, { status: 400 });
    }

    const result = await query<{ insertId: number }>(
      'INSERT INTO recetas (nombre, es_subreceta, descripcion) VALUES (?, ?, ?)',
      [nombre, es_subreceta || false, descripcion || null]
    );

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: (result as unknown as { insertId: number }).insertId },
      message: 'Receta creada correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating receta:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear receta',
    }, { status: 500 });
  }
}
