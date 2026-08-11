-- Alinea una tabla `usuarios` preexistente (creada fuera de este repo, antes de
-- la Fase 1 de seguridad) con el esquema esperado por src/lib/auth.js.
-- Se detectó en la base de datos `usuarios` con columnas
-- (id, nombre, email VARCHAR(100), password VARCHAR(255), rol ENUM('user','admin') DEFAULT 'user')
-- y 0 filas -- no hay datos que migrar, solo se ajusta la forma de la tabla.
-- Ejecutar UNA sola vez: mysql -u root -p mujercitas_db < sql/003_align_usuarios_legacy.sql

ALTER TABLE usuarios CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL;
ALTER TABLE usuarios MODIFY COLUMN email VARCHAR(191) NOT NULL;
ALTER TABLE usuarios MODIFY COLUMN rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente';
ALTER TABLE usuarios ADD COLUMN creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
