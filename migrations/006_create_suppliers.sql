-- ============================================================
-- Migración 006: tabla suppliers
-- Proveedores. Referenciados por facturas recibidas.
-- Sin dependencias externas.
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS suppliers (
    id             INT           AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255)  NOT NULL,
    company_name   VARCHAR(255)  NULL,
    tax_id         VARCHAR(50)   NULL,
    address        VARCHAR(500)  NULL,
    postal_code    VARCHAR(10)   NULL,
    city           VARCHAR(255)  NULL,
    province       VARCHAR(100)  NULL,
    country        VARCHAR(100)  NULL DEFAULT 'España',
    phone          VARCHAR(20)   NULL,
    email          VARCHAR(255)  NULL,
    contact_person VARCHAR(255)  NULL,
    payment_terms  INT           NULL DEFAULT 30,
    bank_account   VARCHAR(50)   NULL,
    notes          TEXT          NULL,
    active         TINYINT(1)    NOT NULL DEFAULT 1,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
