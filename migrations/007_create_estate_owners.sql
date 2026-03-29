-- ============================================================
-- Migración 007: tabla estate_owners
-- Relación N:M entre inmuebles y propietarios con porcentaje de propiedad.
-- Depende de: estates (004), owners (003)
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS estate_owners (
    id                   INT          AUTO_INCREMENT PRIMARY KEY,
    estate_id            INT          NOT NULL,
    owners_id            INT          NOT NULL,
    ownership_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    date_create          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_update          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_estate_owner (estate_id, owners_id),

    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE,
    FOREIGN KEY (owners_id) REFERENCES owners(id)  ON DELETE CASCADE
);
