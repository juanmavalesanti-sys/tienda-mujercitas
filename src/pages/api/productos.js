// src/pages/api/productos.js
import pool from '../../lib/db.js';

// 1. Canal GET: Lee los productos reales de tu base de datos MySQL
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al leer la base de datos' }), { status: 500 });
  }
}

// 2. Canal POST: Recibe la ropa nueva del administrador y la guarda en MySQL
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { nombre, precio, descripcion, imagen_url } = body;

    // Validación básica de campos obligatorios
    if (!nombre || !precio || !imagen_url) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    const query = 'INSERT INTO productos (nombre, precio, descripcion, imagen_url, stock) VALUES (?, ?, ?, ?, 10)';
    const [result] = await pool.query(query, [nombre, precio, descripcion, imagen_url]);

    return new Response(JSON.stringify({ success: true, id: result.insertId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al insertar en MySQL: ' + error.message }), { status: 500 });
  }
}
