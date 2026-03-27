import db from '../db/dbConnect.js';

/**
 * Repositorio para configuración de usuario.
 * Combina datos de users + user_settings (requiere CREATE TABLE manual).
 * Si la tabla no existe, devuelve defaults para los campos de configuración.
 */
export default class SettingsRepository {

    static async findByUserId(userId) {
        try {
            const [rows] = await db.query(`
                SELECT
                    u.id,
                    u.username              AS userName,
                    u.email,
                    COALESCE(s.company_name, '') AS companyName,
                    COALESCE(s.cif, '')          AS cif,
                    COALESCE(s.address, '')      AS address,
                    COALESCE(s.default_tax, 21)  AS defaultTax,
                    COALESCE(s.currency, 'EUR')  AS currency
                FROM users u
                LEFT JOIN user_settings s ON u.id = s.user_id
                WHERE u.id = ?
            `, [userId]);
            return rows;
        } catch {
            // user_settings no existe — devolver solo datos del usuario con defaults
            const [rows] = await db.query(`
                SELECT id, username AS userName, email FROM users WHERE id = ?
            `, [userId]);
            return rows.map(u => ({
                ...u,
                companyName: '',
                cif: '',
                address: '',
                defaultTax: 21,
                currency: 'EUR'
            }));
        }
    }

    static async upsert(userId, data) {
        try {
            await db.query(
                `INSERT INTO user_settings (user_id, company_name, cif, address, default_tax, currency)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    company_name = VALUES(company_name),
                    cif          = VALUES(cif),
                    address      = VALUES(address),
                    default_tax  = VALUES(default_tax),
                    currency     = VALUES(currency)`,
                [userId, data.companyName ?? '', data.cif ?? '', data.address ?? '', data.defaultTax ?? 21, data.currency ?? 'EUR']
            );
        } catch {
            // user_settings no existe — ignorar (ejecutar migración para activar esta función)
        }
        await db.query(
            'UPDATE users SET email = ? WHERE id = ?',
            [data.email, userId]
        );
    }
}
