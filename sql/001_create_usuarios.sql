CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)  NOT NULL DEFAULT '',
  email         VARCHAR(191)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  rol           ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
  creado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
