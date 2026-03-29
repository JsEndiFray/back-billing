-- ============================================================
-- Migración 001: tabla users
-- Tabla base del sistema de autenticación.
-- Sin dependencias externas.
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS users (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    role        VARCHAR(20)  NOT NULL,
    date_create TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_update TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_email    (email),
    UNIQUE KEY uq_phone    (phone)
);
