-- ============================================================
-- Migración 002: tabla clients
-- Arrendatarios/inquilinos. Soporta jerarquía empresa-administrador
-- mediante auto-referencia en parent_company_id.
-- Sin dependencias externas.
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS clients (
    id                INT          AUTO_INCREMENT PRIMARY KEY,
    type_client       VARCHAR(50)  NOT NULL,
    name              VARCHAR(255) NULL,
    lastname          VARCHAR(255) NULL,
    company_name      VARCHAR(255) NULL,
    identification    VARCHAR(50)  NOT NULL,
    phone             VARCHAR(20)  NULL,
    email             VARCHAR(255) NULL,
    address           VARCHAR(500) NULL,
    postal_code       VARCHAR(10)  NULL,
    location          VARCHAR(255) NULL,
    province          VARCHAR(100) NULL,
    country           VARCHAR(100) NULL,
    parent_company_id INT          NULL,
    relationship_type VARCHAR(50)  NULL,
    date_create       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_update       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_identification (identification),
    INDEX idx_parent_company_id  (parent_company_id),

    FOREIGN KEY (parent_company_id) REFERENCES clients(id) ON DELETE SET NULL
);
