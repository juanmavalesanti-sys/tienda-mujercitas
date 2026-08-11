// src/pages/api/checkout.js
import crypto from 'node:crypto';
import pool from '../../lib/db.js';

const METODOS_VALIDOS = ['transferencia', 'yape', 'plin'];

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonResponse({ error: 'Cuerpo de la petición inválido' }, 400);
  }

  const cliente_nombre = String(body.cliente_nombre || '').trim();
  const cliente_telefono = String(body.cliente_telefono || '').trim();
  const direccion_envio = String(body.direccion_envio || '').trim();
  const metodo_pago = String(body.metodo_pago || '').trim().toLowerCase();
  const itemsInput = Array.isArray(body.items) ? body.items : [];

  if (!cliente_nombre || !cliente_telefono || !direccion_envio) {
    return jsonResponse({ error: 'Faltan datos de contacto o envío' }, 400);
  }
  if (!METODOS_VALIDOS.includes(metodo_pago)) {
    return jsonResponse({ error: 'Método de pago inválido' }, 400);
  }
  if (itemsInput.length === 0) {
    return jsonResponse({ error: 'El carrito está vacío' }, 400);
  }

  // Deduplicar items por id sumando cantidades, y validar cada cantidad.
  const cantidadPorId = new Map();
  for (const item of itemsInput) {
    const id = Number(item.id);
    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(cantidad) || cantidad <= 0) {
      return jsonResponse({ error: 'Item de carrito inválido' }, 400);
    }
    cantidadPorId.set(id, (cantidadPorId.get(id) || 0) + cantidad);
  }
  const idsUnicos = [...cantidadPorId.keys()];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [productosRows] = await connection.query(
      'SELECT id, nombre, precio, stock FROM productos WHERE id IN (?)',
      [idsUnicos]
    );

    if (productosRows.length !== idsUnicos.length) {
      const idsEncontrados = new Set(productosRows.map((p) => p.id));
      const idsFaltantes = idsUnicos.filter((id) => !idsEncontrados.has(id));
      await connection.rollback();
      return jsonResponse(
        { error: 'producto_invalido', detalles: idsFaltantes.map((id) => ({ id })) },
        400
      );
    }

    const productosPorId = new Map(productosRows.map((p) => [p.id, p]));
    const fallosStock = [];

    for (const [id, cantidad] of cantidadPorId) {
      const [result] = await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [cantidad, id, cantidad]
      );
      if (result.affectedRows === 0) {
        fallosStock.push(id);
      }
    }

    if (fallosStock.length > 0) {
      await connection.rollback();
      const [stockActual] = await pool.query(
        'SELECT id, nombre, stock FROM productos WHERE id IN (?)',
        [fallosStock]
      );
      const stockPorId = new Map(stockActual.map((p) => [p.id, p]));
      return jsonResponse(
        {
          error: 'stock_insuficiente',
          detalles: fallosStock.map((id) => ({
            id,
            nombre: stockPorId.get(id)?.nombre,
            solicitado: cantidadPorId.get(id),
            disponible: stockPorId.get(id)?.stock ?? 0,
          })),
        },
        409
      );
    }

    let total = 0;
    const itemsParaInsertar = [...cantidadPorId].map(([id, cantidad]) => {
      const producto = productosPorId.get(id);
      const subtotal = Number(producto.precio) * cantidad;
      total += subtotal;
      return {
        producto_id: id,
        nombre_producto: producto.nombre,
        precio_unitario: producto.precio,
        cantidad,
        subtotal,
      };
    });

    const token = crypto.randomBytes(16).toString('hex');

    const [pedidoResult] = await connection.query(
      `INSERT INTO pedidos
         (token, usuario_id, cliente_nombre, cliente_telefono, direccion_envio, metodo_pago, total, estado)
       VALUES (?, NULL, ?, ?, ?, ?, ?, 'pendiente_pago')`,
      [token, cliente_nombre, cliente_telefono, direccion_envio, metodo_pago, total]
    );
    const pedidoId = pedidoResult.insertId;

    for (const item of itemsParaInsertar) {
      await connection.query(
        `INSERT INTO pedido_items
           (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.producto_id, item.nombre_producto, item.precio_unitario, item.cantidad, item.subtotal]
      );
    }

    await connection.commit();
    return jsonResponse({ success: true, token, total }, 201);
  } catch (error) {
    await connection.rollback();
    return jsonResponse({ error: 'Error al procesar el pedido: ' + error.message }, 500);
  } finally {
    connection.release();
  }
}
