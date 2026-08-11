// src/lib/auth.js
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from './db.js';

export const SESSION_COOKIE_NAME = 'mujercitas_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function createSession(usuarioId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = sha256(token);
  const expiraEn = new Date(Date.now() + SESSION_TTL_MS);

  await pool.query(
    'INSERT INTO sesiones (token_hash, usuario_id, expira_en) VALUES (?, ?, ?)',
    [tokenHash, usuarioId, expiraEn]
  );

  return { token, expiraEn };
}

export async function getSessionUser(token) {
  if (!token) return null;

  const tokenHash = sha256(token);
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.nombre, u.rol
     FROM sesiones s
     JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.token_hash = ? AND s.expira_en > NOW()`,
    [tokenHash]
  );

  return rows[0] || null;
}

export async function destroySession(token) {
  if (!token) return;
  const tokenHash = sha256(token);
  await pool.query('DELETE FROM sesiones WHERE token_hash = ?', [tokenHash]);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  };
}
