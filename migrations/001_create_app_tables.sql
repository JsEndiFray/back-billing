-- ============================================================
-- Migración: tablas que requieren privilegio CREATE TABLE
-- Ejecutar con usuario administrador de MySQL
-- ============================================================

USE proyecto_facturas_dev;

-- Tabla de configuración por usuario
CREATE TABLE IF NOT EXISTS user_settings (
    user_id      INT PRIMARY KEY,
    company_name VARCHAR(255)   DEFAULT '',
    cif          VARCHAR(20)    DEFAULT '',
    address      VARCHAR(500)   DEFAULT '',
    default_tax  DECIMAL(5,2)   DEFAULT 21.00,
    currency     VARCHAR(10)    DEFAULT 'EUR',
    updated_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de estado "leído" para notificaciones computadas
CREATE TABLE IF NOT EXISTS notification_reads (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    notification_id INT NOT NULL,
    read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_read (user_id, notification_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
