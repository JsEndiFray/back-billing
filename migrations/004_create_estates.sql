-- ============================================================
-- Migración 004: tabla estates
-- Inmuebles gestionados. Identificados por referencia catastral.
-- Sin dependencias externas.
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS estates (
    id                  INT           AUTO_INCREMENT PRIMARY KEY,
    cadastral_reference VARCHAR(50)   NOT NULL,
    price               DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    address             VARCHAR(500)  NOT NULL,
    postal_code         VARCHAR(10)   NULL,
    location            VARCHAR(255)  NULL,
    province            VARCHAR(100)  NULL,
    country             VARCHAR(100)  NULL,
    surface             DECIMAL(10,2) NULL,
    date_create         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    date_update         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_cadastral_reference (cadastral_reference)
);
