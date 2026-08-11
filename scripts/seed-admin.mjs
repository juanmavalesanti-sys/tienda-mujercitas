// scripts/seed-admin.mjs
// Uso: node scripts/seed-admin.mjs
// Crea (o resetea la contraseña de) el usuario administrador, pidiendo los
// datos por consola para que la contraseña nunca quede escrita en el repo.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import pool from '../src/lib/db.js';
import { hashPassword } from '../src/lib/auth.js';

const rl = createInterface({ input: stdin, output: stdout });

try {
  const nombre = (await rl.question('Nombre del administrador: ')).trim();
  const email = (await rl.question('Email del administrador: ')).trim().toLowerCase();
  const password = await rl.question('Contraseña (mínimo 8 caracteres): ');

  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios.');
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }

  const passwordHash = await hashPassword(password);

  await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), rol = 'admin'`,
    [nombre, email, passwordHash]
  );

  console.log(`\n✅ Administrador "${email}" creado/actualizado correctamente.`);
} catch (error) {
  console.error(`\n❌ ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
