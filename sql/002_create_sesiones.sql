CREATE TABLE IF NOT EXISTS sesiones (
  token_hash CHAR(64) NOT NULL PRIMARY KEY,
  usuario_id INT NOT NULL,
  creado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_en  DATETIME NOT NULL,
  CONSTRAINT fk_sesiones_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  KEY idx_sesiones_usuario (usuario_id),
  KEY idx_sesiones_expira (expira_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
