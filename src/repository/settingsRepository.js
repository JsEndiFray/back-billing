import db from '../db/dbConnect.js';

/**
 * Repositorio para configuración de usuario.
 * Combina datos de users + user_settings (tabla auto-creada).
 */
export default class SettingsRepository {

    static async initTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id    INT PRIMARY KEY,
                company_name VARCHAR(255) DEFAULT '',
                cif          VARCHAR(20)  DEFAULT '',
                address      VARCHAR(500) DEFAULT '',
                default_tax  DECIMAL(5,2) DEFAULT 21.00,
                currency     VARCHAR(10)  DEFAULT 'EUR',
                updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    }

    static async findByUserId(userId) {
        await this.initTable();
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
    }

    static async upsert(userId, data) {
        await this.initTable();
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
        await db.query(
            'UPDATE users SET email = ? WHERE id = ?',
            [data.email, userId]
        );
    }
}
