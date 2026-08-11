// src/pages/imagenes-subidas/[archivo].js
import fs from 'node:fs/promises';
import path from 'node:path';

const uploadsDir = path.join(process.cwd(), 'uploads', 'imagenes');

const EXT_TO_MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export async function GET({ params }) {
  const archivo = params.archivo || '';
  const nombreSeguro = path.basename(archivo);

  if (!nombreSeguro || nombreSeguro !== archivo) {
    return new Response('Nombre de archivo inválido', { status: 400 });
  }

  const ext = nombreSeguro.split('.').pop()?.toLowerCase();
  const mime = EXT_TO_MIME[ext || ''];
  if (!mime) {
    return new Response('Tipo de archivo no soportado', { status: 400 });
  }

  try {
    const buffer = await fs.readFile(path.join(uploadsDir, nombreSeguro));
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Imagen no encontrada', { status: 404 });
  }
}
