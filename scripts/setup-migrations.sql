-- ============================================================
-- Setup inicial del sistema de migraciones.
-- Ejecutar UNA SOLA VEZ por un usuario con privilegio CREATE:
--
--   mysql -h HOST -u ADMIN_USER -p DB_DATABASE < scripts/setup-migrations.sql
--
-- Después de esto, `npm run migrate` puede ejecutarse con el
-- usuario de aplicación (solo necesita SELECT, INSERT).
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    filename   VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_filename (filename)
);
