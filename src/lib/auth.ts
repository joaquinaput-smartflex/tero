import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'tero-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: number;
  username: string;
  role: 'admin' | 'chef' | 'viewer';
  exp?: number;
  iat?: number;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  nombre: string | null;
  role: 'admin' | 'chef' | 'viewer';
  activo: boolean;
  last_login: Date | null;
  created_at: Date;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: { id: number; username: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

// Check if user has required role
export function hasRole(user: JWTPayload | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

// Role hierarchy for permission checks
export const rolePermissions = {
  admin: ['admin', 'chef', 'viewer'],
  chef: ['chef', 'viewer'],
  viewer: ['viewer'],
};

export function canAccess(userRole: string, requiredRole: string): boolean {
  const permissions = rolePermissions[userRole as keyof typeof rolePermissions];
  return permissions?.includes(requiredRole) || false;
}
