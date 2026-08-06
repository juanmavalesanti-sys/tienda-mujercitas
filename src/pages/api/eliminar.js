// src/pages/api/eliminar.js
import pool from '../../lib/db.js';

export async function POST({ request }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Falta el ID del producto' }), { status: 400 });
    }

    const query = 'DELETE FROM productos WHERE id = ?';
    await pool.query(query, [id]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al eliminar en MySQL: ' + error.message }), { status: 500 });
  }
}
