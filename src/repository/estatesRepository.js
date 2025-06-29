import db from '../db/dbConnect.js';

/**
 * Repositorio para gestionar propiedades inmobiliarias
 */
export default class EstatesRepository {

    /**
     * Obtiene todas las propiedades
     */
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM estates');
        return rows;
    }

    /**
     * Para dropdowns - ID y dirección como nombre
     */
    static async getAllForDropdown() {
        const [rows] = await db.query('SELECT id, address AS property_name FROM estates ORDER BY address ASC');
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca por referencia catastral (único)
     */
    static async findByCadastralReference(cadastral_reference) {
        const [rows] = await db.query(`SELECT * FROM estates WHERE LOWER(TRIM(cadastral_reference)) = LOWER(TRIM(?))`, [cadastral_reference]);
        return rows;
    }

    /**
     * Busca por ID único
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM estates WHERE id = ?', [id]);
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crea nueva propiedad
     * @returns {number} ID de la propiedad creada
     */
    static async create(estate) {
        const {cadastral_reference, price, address, postal_code, location, province, country, surface} = estate;
        const [result] = await db.query('INSERT INTO estates (cadastral_reference, price, address, postal_code, location, province, country, surface, date_create, date_update)' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [cadastral_reference, price, address, postal_code, location, province, country, surface]);
        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza propiedad existente
     */
    static async update(estate) {
        const {id, cadastral_reference, price, address, postal_code, location, province, country, surface} = estate;
        const [result] = await db.query('UPDATE estates SET cadastral_reference = ?, price = ?, address = ?, postal_code = ?, location = ?, province = ?, country = ?, surface = ?, date_update = NOW() WHERE id = ?',
            [cadastral_reference, price, address, postal_code, location, province, country, surface, id]);
        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina propiedad
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM estates WHERE id = ?', [id]);
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }
}

/**
 * ESTRUCTURA TABLA ESTATES:
 * - id (PK)
 * - cadastral_reference (referencia catastral única)
 * - price (precio/valor)
 * - address (dirección)
 * - postal_code, location, province, country (ubicación)
 * - surface (superficie en m²)
 * - date_create, date_update (timestamps)
 */