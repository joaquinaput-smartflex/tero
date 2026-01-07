import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { PlatoCarta, ApiResponse } from '@/types';

// GET /api/platos - List all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const seccion_id = searchParams.get('seccion_id');

    let sql = `
      SELECT
        p.*,
        r.nombre as receta_nombre,
        s.nombre as seccion_nombre,
        s.orden as seccion_orden,
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
        ) FROM receta_ingredientes ri WHERE ri.receta_id = p.receta_id) as costo
      FROM platos_carta p
      LEFT JOIN recetas r ON p.receta_id = r.id
      LEFT JOIN secciones_carta s ON p.seccion_id = s.id
      WHERE p.activo = 1
    `;

    const params: (string | number)[] = [];

    if (search) {
      sql += ' AND (p.nombre_carta LIKE ? OR r.nombre LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (seccion_id) {
      sql += ' AND p.seccion_id = ?';
      params.push(parseInt(seccion_id));
    }

    sql += ' ORDER BY s.orden, p.numero, p.nombre_carta';

    const platos = await query<PlatoCarta[]>(sql, params);

    // Calculate margin and status
    const platosWithMargin = platos.map((plato) => {
      const costo = plato.costo || 0;
      const precio = plato.precio_carta || 0;
      const margen_real = precio > 0 ? (precio - costo) / precio : 0;
      const precio_sugerido = costo / (1 - plato.margen_objetivo);

      let estado: 'OK' | 'ALERTA' | 'CRITICO' = 'OK';
      if (margen_real < plato.margen_objetivo * 0.8) {
        estado = 'CRITICO';
      } else if (margen_real < plato.margen_objetivo) {
        estado = 'ALERTA';
      }

      return {
        ...plato,
        margen_real,
        estado,
        precio_sugerido: estado !== 'OK' ? precio_sugerido : undefined,
      };
    });

    return NextResponse.json<ApiResponse<PlatoCarta[]>>({
      success: true,
      data: platosWithMargin,
    });
  } catch (error) {
    console.error('Error fetching platos:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener platos',
    }, { status: 500 });
  }
}

// POST /api/platos - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receta_id, seccion_id, numero, nombre_carta, precio_carta, margen_objetivo } = body;

    if (!receta_id || !seccion_id || !nombre_carta || !precio_carta) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Receta, sección, nombre y precio son requeridos',
      }, { status: 400 });
    }

    const result = await query<{ insertId: number }>(
      `INSERT INTO platos_carta (receta_id, seccion_id, numero, nombre_carta, precio_carta, margen_objetivo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [receta_id, seccion_id, numero || null, nombre_carta, precio_carta, margen_objetivo || 0.75]
    );

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: (result as unknown as { insertId: number }).insertId },
      message: 'Plato agregado a la carta correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating plato:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al agregar plato',
    }, { status: 500 });
  }
}
