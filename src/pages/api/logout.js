// src/pages/api/logout.js
import { destroySession, SESSION_COOKIE_NAME } from '../../lib/auth.js';

export async function POST({ cookies }) {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  await destroySession(token);
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
