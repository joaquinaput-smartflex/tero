import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// GET /api/eventos/stats - Dashboard statistics
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const anio = searchParams.get('anio') || new Date().getFullYear().toString();

    // General stats
    const [generalStats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) as total_eventos,
        SUM(CASE WHEN confirmado = 1 THEN 1 ELSE 0 END) as eventos_confirmados,
        COALESCE(SUM(total_evento), 0) as facturacion_total,
        COALESCE(SUM(adultos + menores), 0) as total_invitados,
        COALESCE(AVG(total_evento), 0) as promedio_por_evento
      FROM eventos
      WHERE YEAR(fecha) = ?
    `, [anio]);

    // Payment stats
    const [paymentStats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COALESCE(SUM(CASE WHEN p.concepto IN ('pago', 'sena') THEN p.monto ELSE 0 END), 0) as total_cobrado,
        COALESCE(SUM(e.total_evento), 0) -
          COALESCE(SUM(CASE WHEN p.concepto IN ('pago', 'sena') THEN p.monto ELSE 0 END), 0) as saldo_pendiente
      FROM eventos e
      LEFT JOIN pagos_evento p ON p.evento_id = e.id
      WHERE YEAR(e.fecha) = ?
    `, [anio]);

    // Events by month
    const [porMes] = await pool.execute<RowDataPacket[]>(`
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        COUNT(*) as cantidad,
        COALESCE(SUM(total_evento), 0) as facturacion
      FROM eventos
      WHERE YEAR(fecha) = ?
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes
    `, [anio]);

    // Events by vendor
    const [porVendedor] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COALESCE(vendedor, 'Sin asignar') as vendedor,
        COUNT(*) as cantidad,
        COALESCE(SUM(total_evento), 0) as facturacion
      FROM eventos
      WHERE YEAR(fecha) = ?
      GROUP BY vendedor
      ORDER BY facturacion DESC
    `, [anio]);

    // Events by type
    const [porTipo] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COALESCE(tipo_evento, 'Sin tipo') as tipo,
        COUNT(*) as cantidad
      FROM eventos
      WHERE YEAR(fecha) = ?
      GROUP BY tipo_evento
      ORDER BY cantidad DESC
    `, [anio]);

    // Upcoming events (next 30 days)
    const [proximos] = await pool.execute<RowDataPacket[]>(`
      SELECT
        e.*,
        m.nombre as menu_nombre
      FROM eventos e
      LEFT JOIN menus_evento m ON e.menu_id = m.id
      WHERE e.fecha >= CURDATE()
        AND e.fecha <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND e.confirmado = 1
      ORDER BY e.fecha ASC
      LIMIT 10
    `);

    return NextResponse.json({
      ...generalStats[0],
      ...paymentStats[0],
      eventos_por_mes: porMes,
      eventos_por_vendedor: porVendedor,
      eventos_por_tipo: porTipo,
      proximos_eventos: proximos
    });
  } catch (error) {
    console.error('Error fetching eventos stats:', error);
    return NextResponse.json({ error: 'Error al obtener estadisticas' }, { status: 500 });
  }
}
