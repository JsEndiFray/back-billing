import db from '../db/dbConnect.js';

/**
 * Repositorio para gestionar propietarios del sistema
 */
export default class OwnersRepository {

    /**
     * Obtiene todos los propietarios
     */
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM owners');
        return rows;
    }

    /**
     * Obtiene propietarios solo con id y nombre (dropdowns)
     */
    static async getAllForDropdown() {
        const [rows] = await db.query('SELECT id, name FROM owners ORDER BY name ASC');
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca propietarios por nombre exacto (sin distinguir mayúsculas/minúsculas)
     */
    static async findByName(name) {
        const [rows] = await db.query(`SELECT *
                                       FROM owners
                                       WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))`,
            [name]
        );
        return rows;
    }

    /**
     * Busca propietarios por apellidos exactos (sin distinguir mayúsculas/minúsculas)
     */
    static async findByLastname(lastname) {
        const [rows] = await db.query(
            'SELECT * FROM owners WHERE LOWER(TRIM(lastname)) = LOWER(TRIM(?))',
            [lastname]
        );
        return rows;
    }

    /**
     * Busca un propietario por identificación (NIF/NIE/CIF)
     */
    static async findByIdentification(identification) {
        const [rows] = await db.query(
            'SELECT * FROM owners WHERE LOWER(TRIM(identification)) = LOWER(TRIM(?))',
            [identification]
        );
        return rows;
    }

    /**
     * Busca un propietario por ID único
     */
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM owners WHERE id = ?',
            [id]
        );
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crea nuevo propietario
     * @returns {number} ID del propietario creado
     */
    static async create(data) {
        const {name, lastname, email, identification, phone, address, postal_code, location, province, country} = data;
        const [result] = await db.query(
            `INSERT INTO owners (name, lastname, email, identification, phone, address, postal_code, location, province,
                                 country, date_create, date_update)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, lastname, email, identification, phone, address, postal_code, location, province, country]
        );
        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza propietario existente
     */
    static async update(data) {
        const {
            id,
            name,
            lastname,
            email,
            identification,
            phone,
            address,
            postal_code,
            location,
            province,
            country
        } = data;
        const [result] = await db.query(
            `UPDATE owners
             SET name           = ?,
                 lastname       = ?,
                 email          = ?,
                 identification = ?,
                 phone          = ?,
                 address        = ?,
                 postal_code    = ?,
                 location       = ?,
                 province       = ?,
                 country        = ?,
                 date_update    = NOW()
             WHERE id = ?`,
            [name, lastname, email, identification, phone, address, postal_code, location, province, country, id]
        );
        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina propietario por ID
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM owners WHERE id = ?', [id]);
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }
}

/**
 * ESTRUCTURA TABLA OWNERS:
 * - id (PK)
 * - name
 * - lastname
 * - email
 * - identification (NIF/NIE/CIF)
 * - phone
 * - address
 * - postal_code
 * - location
 * - province
 * - country
 * - date_create, date_update (timestamps)
 */