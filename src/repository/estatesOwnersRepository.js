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

    // Obtener todos (JOIN para traer nombres)
    static async getAll() {
        const [rows] = await db.query(`SELECT eo.id, eo.estate_id, e.address AS estate_name, eo.owners_id, o.name AS owner_name,
                                              eo.ownership_precent, eo.date_create, eo.date_update
                                       FROM estate_owners eo
                                                JOIN estates e ON eo.estate_id = e.id
                                                JOIN owners o ON eo.owners_id = o.id`);
        return rows;
    }
 //BÚSQUEDAS

    // Buscar por propiedad + propietario
    static async findByEstateAndOwners(estate_id, owners_id) {
        const [rows] = await db.query(
            'SELECT * FROM estate_owners WHERE estate_id = ? AND owners_id = ?',
            [estate_id, owners_id]
        );
        return rows;
    }

    // Buscar por ID ÚNICO
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM estate_owners WHERE id = ?',
            [id]
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

    // Actualizar por ID ÚNICO
    static async updateById(id, ownershipPercent) {
        const [result] = await db.query(
            `UPDATE estate_owners SET ownership_precent = ? WHERE id = ?`,
            [ownershipPercent, id]
        );
        return result.affectedRows > 0;
    }

    // Eliminar por ID ÚNICO
    static async deleteById(id) {
        const [result] = await db.query(
            `DELETE FROM estate_owners WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    }
}