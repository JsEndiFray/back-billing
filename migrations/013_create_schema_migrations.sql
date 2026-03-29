-- ============================================================
-- Migración 013: tabla schema_migrations
-- Registra qué migraciones SQL se han aplicado y cuándo.
-- El runner (scripts/migrate.js) la crea automáticamente
-- antes de comprobar migraciones pendientes.
-- Sin dependencias externas.
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    filename   VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_filename (filename)
);
