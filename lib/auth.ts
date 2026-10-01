import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

/**
 * Get the current user session
 * @returns The current session or null if not authenticated
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Require authentication for server actions
 * @throws Error if user is not authenticated
 * @returns The authenticated user
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in to perform this action');
  }

  return session.user;
}

/**
 * Require admin role for server actions
 * @throws Error if user is not an admin
 * @returns The authenticated admin user
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
