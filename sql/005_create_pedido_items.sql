CREATE TABLE IF NOT EXISTS pedido_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT NOT NULL,
  producto_id     INT NULL,
  nombre_producto VARCHAR(100)  NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad        INT NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_pedido_items_pedido FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_pedido_items_producto FOREIGN KEY (producto_id)
    REFERENCES productos(id) ON DELETE SET NULL,
  KEY idx_pedido_items_pedido (pedido_id),
  KEY idx_pedido_items_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
