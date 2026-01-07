import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'tero',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function for queries
export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Get a connection from the pool (for transactions)
export async function getConnection() {
  return await pool.getConnection();
}

export default pool;
