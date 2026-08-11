-- Amplía la tabla `pedidos` preexistente (id, usuario_id, total, fecha) para
-- soportar el checkout de invitado real de la Fase 2. La tabla está vacía
-- (0 filas): no hay datos que migrar, solo se agregan columnas nuevas.
-- Ejecutar UNA sola vez: mysql -u root -p mujercitas_db < sql/004_align_pedidos_legacy.sql

ALTER TABLE pedidos
  ADD COLUMN token            CHAR(32)     NOT NULL,
  ADD COLUMN cliente_nombre   VARCHAR(150) NOT NULL,
  ADD COLUMN cliente_telefono VARCHAR(30)  NOT NULL,
  ADD COLUMN direccion_envio  VARCHAR(255) NOT NULL,
  ADD COLUMN metodo_pago      VARCHAR(50)  NOT NULL,
  ADD COLUMN estado           ENUM('pendiente_pago','pagado','enviado','cancelado')
                               NOT NULL DEFAULT 'pendiente_pago',
  ADD COLUMN actualizado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE pedidos ADD UNIQUE KEY uk_pedidos_token (token);
ALTER TABLE pedidos ADD KEY idx_pedidos_estado (estado);
