-- ============================================================
-- Migración 003: tabla owners
-- Propietarios de inmuebles.
-- Sin dependencias externas.
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS owners (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    lastname       VARCHAR(255) NULL,
    email          VARCHAR(255) NULL,
    identification VARCHAR(50)  NOT NULL,
    phone          VARCHAR(20)  NULL,
    address        VARCHAR(500) NULL,
    postal_code    VARCHAR(10)  NULL,
    location       VARCHAR(255) NULL,
    province       VARCHAR(100) NULL,
    country        VARCHAR(100) NULL,
    date_create    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_update    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_identification (identification)
);
