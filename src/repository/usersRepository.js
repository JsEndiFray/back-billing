import db from '../db/dbConnect.js';

/**
 * Repositorio para gestionar usuarios del sistema
 */
export default class UsersRepository {

    /**
     * Obtiene todos los usuarios registrados
     */
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca por nombre de usuario (para login)
     */
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows;
    }

    /**
     * Busca por email (único)
     */
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    }

    /**
     * Busca por teléfono (único)
     */
    static async findByPhone(phone) {
        const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]); // Corregido: faltaban []
        return rows;
    }

    /**
     * Busca por ID único
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crea nuevo usuario
     * @returns {number} ID del usuario creado
     */
    static async create(user) {
        const {username, password, email, phone, role} = user;
        const [result] = await db.query('INSERT INTO users (username, password, email, phone, role, date_create, date_update)' +
            'VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [username, password, email, phone, role]);
        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza usuario existente
     */
    static async update(user) {
        const {id, username, password, email, phone, role} = user;
        const [result] = await db.query('UPDATE users SET username = ?, password = ?, email = ?, phone = ?, role = ?, date_update = NOW() WHERE id = ? ',
            [username, password, email, phone, role, id]);
        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina usuario
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]); // Corregido: ID -> id
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }
}

/**
 * ESTRUCTURA TABLA USERS:
 * - id (PK)
 * - username (único)
 * - password (hash)
 * - email (único)
 * - phone (único)
 * - role (admin, user, etc.)
 * - date_create, date_update (timestamps)
 *
 * CORRECCIONES APLICADAS:
 * - Agregados [] en parámetros de findByUsername, findByEmail, findByPhone
 * - Corregido WHERE ID = ? a WHERE id = ? en delete()
 */