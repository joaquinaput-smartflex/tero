/**
 * Seed script to create the initial admin user
 * Run with: npx ts-node scripts/seed-admin.ts
 * Or after build: node -r dotenv/config scripts/seed-admin.js
 */

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123', // Change this in production!
  nombre: 'Administrador',
  email: 'admin@tero.local',
  role: 'admin',
};

async function seedAdmin() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'tero',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tero',
  });

  try {
    console.log('🔑 Seeding admin user...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);

    // Check if admin already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [DEFAULT_ADMIN.username]
    );

    if ((existing as unknown[]).length > 0) {
      console.log('⚠️  Admin user already exists. Skipping.');
      await pool.end();
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    // Insert admin user
    await pool.execute(
      `INSERT INTO users (username, email, password_hash, nombre, role, activo)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [
        DEFAULT_ADMIN.username,
        DEFAULT_ADMIN.email,
        passwordHash,
        DEFAULT_ADMIN.nombre,
        DEFAULT_ADMIN.role,
      ]
    );

    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${DEFAULT_ADMIN.username}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

    await pool.end();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await pool.end();
    process.exit(1);
  }
}

seedAdmin();
