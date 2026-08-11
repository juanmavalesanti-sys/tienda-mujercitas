// src/pages/api/login.js
import pool from '../../lib/db.js';
import { verifyPassword, createSession, sessionCookieOptions, SESSION_COOKIE_NAME } from '../../lib/auth.js';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Correo o contraseña incorrectos' }), { status: 401 });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email.trim().toLowerCase()]);
    const usuario = rows[0];

    const passwordValida = usuario ? await verifyPassword(password, usuario.password_hash) : false;

    if (!usuario || !passwordValida) {
      return new Response(JSON.stringify({ error: 'Correo o contraseña incorrectos' }), { status: 401 });
    }

    const { token } = await createSession(usuario.id);
    cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());

    return new Response(JSON.stringify({ success: true, rol: usuario.rol }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al iniciar sesión: ' + error.message }), { status: 500 });
  }
}
