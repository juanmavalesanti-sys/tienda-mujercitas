// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { getSessionUser, SESSION_COOKIE_NAME } from './lib/auth.js';

const ADMIN_API_ROUTES = [
  { method: 'POST', path: '/api/productos' },
  { method: 'POST', path: '/api/editar' },
  { method: 'POST', path: '/api/eliminar' },
  { method: 'POST', path: '/api/pedidos/estado' },
  { method: 'POST', path: '/api/upload' },
];

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  context.locals.user = await getSessionUser(token);

  const { pathname } = context.url;
  const isAdmin = context.locals.user?.rol === 'admin';

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isAdmin) {
      return context.redirect('/login');
    }
    return next();
  }

  const matchesAdminApi = ADMIN_API_ROUTES.some(
    (route) => route.method === context.request.method && route.path === pathname
  );

  if (matchesAdminApi) {
    if (!context.locals.user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
});
