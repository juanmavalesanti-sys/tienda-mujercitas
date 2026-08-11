// src/pages/api/upload.js
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIME_TO_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

const uploadsDir = path.join(process.cwd(), 'uploads', 'imagenes');

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST({ request }) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: 'Cuerpo de la petición inválido' }, 400);
  }

  const file = formData.get('imagen');

  if (!(file instanceof File) || file.size === 0) {
    return jsonResponse({ error: 'No se recibió ninguna imagen' }, 400);
  }
  if (file.size > MAX_SIZE_BYTES) {
    return jsonResponse({ error: 'La imagen supera el tamaño máximo de 5MB' }, 400);
  }
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return jsonResponse({ error: 'Formato de imagen no soportado (usa PNG, JPG o WEBP)' }, 400);
  }

  const nombreArchivo = `${crypto.randomBytes(8).toString('hex')}.${ext}`;

  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, nombreArchivo), buffer);
  } catch (error) {
    return jsonResponse({ error: 'Error al guardar la imagen: ' + error.message }, 500);
  }

  return jsonResponse({ success: true, imagen_url: `/imagenes-subidas/${nombreArchivo}` }, 201);
}
