// src/pages/api/editar.js
import pool from '../../lib/db.js';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { id, nombre, precio, descripcion, imagen_url } = body;

    if (!id || !nombre || !precio || !imagen_url) {
      return new Response(JSON.stringify({ error: 'Campos obligatorios vacíos' }), { status: 400 });
    }

    const query = 'UPDATE productos SET nombre = ?, precio = ?, descripcion = ?, imagen_url = ? WHERE id = ?';
    await pool.query(query, [nombre, precio, descripcion, imagen_url, id]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al actualizar en MySQL: ' + error.message }), { status: 500 });
  }
}
