import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Insumo, ApiResponse } from '@/types';

// GET /api/insumos - List all insumos with latest prices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria_id = searchParams.get('categoria_id');
    const proveedor_id = searchParams.get('proveedor_id');
    const search = searchParams.get('search');

    let sql = `
      SELECT
        i.*,
        c.nombre as categoria_nombre,
        p.nombre as proveedor_nombre,
        pr.precio as ultimo_precio,
        pr.costo_final,
        pr.fecha as fecha_precio,
        ROUND(
          ((pr.precio - pr_ant.precio) / pr_ant.precio) * 100,
          1
        ) as variacion_porcentaje
      FROM insumos i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      LEFT JOIN proveedores p ON i.proveedor_id = p.id
      LEFT JOIN (
        SELECT insumo_id, precio, costo_final, fecha,
               ROW_NUMBER() OVER (PARTITION BY insumo_id ORDER BY fecha DESC) as rn
        FROM precios
      ) pr ON pr.insumo_id = i.id AND pr.rn = 1
      LEFT JOIN (
        SELECT insumo_id, precio,
               ROW_NUMBER() OVER (PARTITION BY insumo_id ORDER BY fecha DESC) as rn
        FROM precios
      ) pr_ant ON pr_ant.insumo_id = i.id AND pr_ant.rn = 2
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (categoria_id) {
      sql += ' AND i.categoria_id = ?';
      params.push(parseInt(categoria_id));
    }

    if (proveedor_id) {
      sql += ' AND i.proveedor_id = ?';
      params.push(parseInt(proveedor_id));
    }

    if (search) {
      sql += ' AND i.nombre LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY c.orden, i.nombre';

    const insumos = await query<Insumo[]>(sql, params);

    return NextResponse.json<ApiResponse<Insumo[]>>({
      success: true,
      data: insumos,
    });
  } catch (error) {
    console.error('Error fetching insumos:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener insumos',
    }, { status: 500 });
  }
}

// POST /api/insumos - Create new insumo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, categoria_id, proveedor_id, unidad_medida, medida_compra, iva_porcentaje, merma_porcentaje } = body;

    if (!nombre || !categoria_id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Nombre y categoría son requeridos',
      }, { status: 400 });
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO insumos (nombre, categoria_id, proveedor_id, unidad_medida, medida_compra, iva_porcentaje, merma_porcentaje)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, categoria_id, proveedor_id || null, unidad_medida || 'Kg', medida_compra || null, iva_porcentaje || 21, merma_porcentaje || 0]
    );

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: (result as unknown as { insertId: number }).insertId },
      message: 'Insumo creado correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating insumo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear insumo',
    }, { status: 500 });
  }
}
