import db from '../db/dbConnect.js';

export default class EstateOwnersRepository {

    // Obtener porcentaje por propiedad y propietario
    static async getOwnershipPercent(estateId, ownersId) {
        const [rows] = await db.query(
            `SELECT ownership_precent FROM estate_owners WHERE estate_id = ? AND owners_id = ?`,
            [estateId, ownersId]
        );
        return rows[0]?.ownership_precent || 0;
    }

    // Obtener todos
    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM estate_owners`);
        return rows;
    }

    // Buscar por propiedad + propietario
    static async findByEstateAndOwners(estate_id, owners_id) {
        const [rows] = await db.query(
            'SELECT * FROM estate_owners WHERE estate_id = ? AND owners_id = ?',
            [estate_id, owners_id]
        );
        return rows;
    }

    // Buscar por ID (propiedad + propietario)
    static async findById(estate_id, owners_id) {
        const [rows] = await db.query(
            'SELECT * FROM estate_owners WHERE estate_id = ? AND owners_id = ?',
            [estate_id, owners_id]
        );
        return rows[0] || null;
    }

    // Crear
    static async create(estateId, ownersId, ownershipPercent) {
        const [result] = await db.query(
            `INSERT INTO estate_owners (estate_id, owners_id, ownership_precent) VALUES (?, ?, ?)`,
            [estateId, ownersId, ownershipPercent]
        );
        return { estateId, ownersId, ownershipPercent };
    }

    // Actualizar
    static async update(estateId, ownersId, ownershipPercent) {
        const [result] = await db.query(
            `UPDATE estate_owners SET ownership_precent = ? WHERE estate_id = ? AND owners_id = ?`,
            [ownershipPercent, estateId, ownersId]
        );
        return result.affectedRows > 0;
    }

    // Eliminar
    static async delete(estateId, ownersId) {
        const [result] = await db.query(
            `DELETE FROM estate_owners WHERE estate_id = ? AND owners_id = ?`,
            [estateId, ownersId]
        );
        return result.affectedRows;
    }
}