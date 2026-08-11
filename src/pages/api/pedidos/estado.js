// src/pages/api/pedidos/estado.js
import pool from '../../../lib/db.js';

const TRANSICIONES_VALIDAS = {
  pendiente_pago: ['pagado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: [],
  cancelado: [],
};

const ESTADOS_VALIDOS = Object.keys(TRANSICIONES_VALIDAS);

export async function POST({ request }) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const estado = String(body.estado || '');

    if (!Number.isInteger(id) || id <= 0 || !ESTADOS_VALIDOS.includes(estado)) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 });
    }

    const [rows] = await pool.query('SELECT estado FROM pedidos WHERE id = ?', [id]);
    const pedido = rows[0];

    if (!pedido) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { status: 404 });
    }

    const transicionesPermitidas = TRANSICIONES_VALIDAS[pedido.estado] || [];
    if (!transicionesPermitidas.includes(estado)) {
      return new Response(
        JSON.stringify({ error: 'transicion_invalida', actual: pedido.estado, solicitada: estado }),
        { status: 409 }
      );
    }

    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);

    return new Response(JSON.stringify({ success: true, estado }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al actualizar el pedido: ' + error.message }), { status: 500 });
  }
}
