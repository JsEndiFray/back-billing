-- ============================================================
-- Migración 002: tabla refresh_tokens
-- Almacena hashes SHA-256 de los refresh tokens emitidos.
-- Permite revocación individual y por usuario (logout global).
-- Ejecutar con usuario administrador de MySQL.
-- ============================================================

USE proyecto_facturas_dev;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    token_hash  VARCHAR(64)  NOT NULL,
    expires_at  DATETIME     NOT NULL,
    revoked     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY  uq_token_hash (token_hash),
    INDEX       idx_user_id   (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
