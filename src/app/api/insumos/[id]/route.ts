import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Insumo, Precio, ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/insumos/[id] - Get single insumo with price history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get insumo details
    const insumos = await query<Insumo[]>(
      `SELECT i.*, c.nombre as categoria_nombre, p.nombre as proveedor_nombre
       FROM insumos i
       LEFT JOIN categorias c ON i.categoria_id = c.id
       LEFT JOIN proveedores p ON i.proveedor_id = p.id
       WHERE i.id = ?`,
      [id]
    );

    if (insumos.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Insumo no encontrado',
      }, { status: 404 });
    }

    // Get price history
    const precios = await query<Precio[]>(
      `SELECT * FROM precios WHERE insumo_id = ? ORDER BY fecha DESC LIMIT 20`,
      [id]
    );

    return NextResponse.json<ApiResponse<{ insumo: Insumo; precios: Precio[] }>>({
      success: true,
      data: {
        insumo: insumos[0],
        precios,
      },
    });
  } catch (error) {
    console.error('Error fetching insumo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener insumo',
    }, { status: 500 });
  }
}

// PUT /api/insumos/[id] - Update insumo
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, categoria_id, proveedor_id, unidad_medida, medida_compra, iva_porcentaje, merma_porcentaje } = body;

    await query(
      `UPDATE insumos SET
        nombre = COALESCE(?, nombre),
        categoria_id = COALESCE(?, categoria_id),
        proveedor_id = ?,
        unidad_medida = COALESCE(?, unidad_medida),
        medida_compra = ?,
        iva_porcentaje = COALESCE(?, iva_porcentaje),
        merma_porcentaje = COALESCE(?, merma_porcentaje),
        updated_at = NOW()
       WHERE id = ?`,
      [nombre, categoria_id, proveedor_id || null, unidad_medida, medida_compra || null, iva_porcentaje, merma_porcentaje, id]
    );

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Insumo actualizado correctamente',
    });
  } catch (error) {
    console.error('Error updating insumo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar insumo',
    }, { status: 500 });
  }
}

// DELETE /api/insumos/[id] - Delete insumo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await query('DELETE FROM insumos WHERE id = ?', [id]);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Insumo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error deleting insumo:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar insumo',
    }, { status: 500 });
  }
}
