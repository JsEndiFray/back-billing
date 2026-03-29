import crypto from 'crypto';
import db from '../db/dbConnect.js';

/**
 * Repositorio para gestión de refresh tokens.
 *
 * Los tokens se almacenan como hash SHA-256: nunca el valor en claro.
 * Esto impide que un volcado de BD permita suplantar sesiones.
 *
 * Los métodos save() y revoke() aceptan un parámetro opcional `conn`
 * para participar en transacciones externas. Si no se pasa, usan el pool.
 */
export default class RefreshTokenRepository {

    /** Devuelve el hash SHA-256 del token. */
    static #hash(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Persiste un nuevo refresh token.
     * @param {number}                userId
     * @param {string}                token     - Valor en claro (se hashea antes de insertar)
     * @param {Date}                  expiresAt
     * @param {import('mysql2').Connection|import('mysql2').Pool} [conn=db]
     */
    static async save(userId, token, expiresAt, conn = db) {
        const hash = this.#hash(token);
        await conn.query(
            'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
            [userId, hash, expiresAt]
        );
    }

    /**
     * Busca un token válido (no revocado y no expirado).
     * @param {string} token - Valor en claro
     * @returns {Promise<object[]>} Filas encontradas (0 ó 1)
     */
    static async findValid(token) {
        const hash = this.#hash(token);
        const [rows] = await db.query(
            `SELECT id, user_id, expires_at
             FROM refresh_tokens
             WHERE token_hash = ?
               AND revoked    = 0
               AND expires_at > NOW()`,
            [hash]
        );
        return rows;
    }

    /**
     * Revoca un token concreto (logout de una sesión).
     * @param {string}                token - Valor en claro
     * @param {import('mysql2').Connection|import('mysql2').Pool} [conn=db]
     */
    static async revoke(token, conn = db) {
        const hash = this.#hash(token);
        await conn.query(
            'UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?',
            [hash]
        );
    }

    /**
     * Revoca todos los tokens activos de un usuario (logout global / cambio de contraseña).
     * @param {number} userId
     */
    static async revokeAllForUser(userId) {
        await db.query(
            'UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND revoked = 0',
            [userId]
        );
    }

    /**
     * Elimina registros expirados o revocados (tarea de mantenimiento periódica).
     */
    static async cleanExpired() {
        await db.query(
            'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = 1'
        );
    }
}
