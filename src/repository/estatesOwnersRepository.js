import db from '../db/dbConnect.js';

/**
 * Repositorio para manejar la tabla estate_owners
 * Gestiona la relación muchos-a-muchos entre propiedades (estates) y propietarios (owners)
 * Incluye el porcentaje de propiedad que cada propietario tiene en cada propiedad
 */
export default class EstateOwnersRepository {

    /**
     * Obtiene el porcentaje de propiedad de un propietario específico en una propiedad específica
     * @param {number} estateId - ID de la propiedad
     * @param {number} ownersId - ID del propietario
     * @returns {number} Porcentaje de propiedad (0 si no existe la relación)
     */
    static async getOwnershipPercent(estateId, ownersId) {
        const [rows] = await db.query(
            `SELECT ownership_percentage
             FROM estate_owners
             WHERE estate_id = ?
               AND owners_id = ?`,
            [estateId, ownersId]
        );
        // Retorna el porcentaje o 0 si no existe la relación
        return rows.length > 0 ? [{percentage: rows[0].ownership_percentage}] : [{percentage: 0}];
    }

    /**
     * Obtiene todas las relaciones propiedad-propietario con información completa
     * Incluye nombres de propiedades y propietarios mediante JOINs
     * @returns {Array} Array de objetos con toda la información de las relaciones
     */
    static async getAll() {
        const [rows] = await db.query(`SELECT eo.id,
                                              eo.estate_id,
                                              e.address AS estate_name,        -- Dirección de la propiedad
                                              eo.owners_id,
                                              o.name    AS owner_name,         -- Nombre del propietario
                                              eo.ownership_percentage,            -- Porcentaje de propiedad
                                              eo.date_create,                  -- Fecha de creación del registro
                                              eo.date_update                   -- Fecha de última actualización
                                       FROM estate_owners eo
                                                JOIN estates e ON eo.estate_id = e.id     -- JOIN con tabla de propiedades
                                                JOIN owners o ON eo.owners_id = o.id`);   // JOIN con tabla de propietarios
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca una relación específica por ID de propiedad e ID de propietario
     * Útil para verificar si ya existe una relación antes de crearla
     * @param {number} estate_id - ID de la propiedad
     * @param {number} owners_id - ID del propietario
     * @returns {Array} Array con los registros encontrados (vacío si no existe)
     */
    static async findByEstateAndOwners(estate_id, owners_id) {
        const [rows] = await db.query(
            'SELECT * FROM estate_owners WHERE estate_id = ? AND owners_id = ?',
            [estate_id, owners_id]
        );
        return rows;
    }

    /**
     * Busca una relación por su ID único en la tabla
     * @param {number} id - ID único del registro en estate_owners
     * @returns {Object|null} Objeto con los datos del registro o null si no existe
     */
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM estate_owners WHERE id = ?',
            [id]
        );
        return rows;
    }

    /**
     * Crea una nueva relación propiedad-propietario
     * @param {number} estateId - ID de la propiedad
     * @param {number} ownersId - ID del propietario
     * @param {number} ownershipPercent - Porcentaje de propiedad (ej: 50.5 para 50.5%)
     * @returns {Object} Objeto con los datos insertados
     */
    static async create(estateId, ownersId, ownershipPercent) {
        const [result] = await db.query(
            `INSERT INTO estate_owners (estate_id, owners_id, ownership_percentage)
             VALUES (?, ?, ?)`,
            [estateId, ownersId, ownershipPercent]
        );

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza el porcentaje de propiedad de una relación existente
     * @param {number} id - ID único del registro a actualizar
     * @param {number} ownershipPercent - Nuevo porcentaje de propiedad
     * @returns {boolean} true si se actualizó algún registro, false si no
     */
    static async updateById(id, ownershipPercent) {
        const [result] = await db.query(
            `UPDATE estate_owners
             SET ownership_percentage = ?
             WHERE id = ?`,
            [ownershipPercent, id]
        );
        // Retorna true si se afectó al menos una fila
        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina una relación propiedad-propietario por su ID único
     * @param {number} id - ID único del registro a eliminar
     * @returns {number} Número de filas eliminadas (0 si no existía el registro)
     */
    static async deleteById(id) {
        const [result] = await db.query(
            `DELETE
             FROM estate_owners
             WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }
}

/**
 * NOTAS ADICIONALES:
 *
 * 1. Hay un error tipográfico en el campo de la base de datos: "ownership_precent"
 *    debería ser "ownership_percent"
 *
 * 2. La tabla estate_owners parece tener estas columnas:
 *    - id (PK auto-incremental)
 *    - estate_id (FK hacia tabla estates)
 *    - owners_id (FK hacia tabla owners)
 *    - ownership_precent (porcentaje de propiedad)
 *    - date_create (fecha de creación)
 *    - date_update (fecha de actualización)
 *
 * 3. El método create() no retorna el ID del nuevo registro creado,
 *    podrías usar result.insertId si lo necesitas
 *
 * 4. Considera validar que los porcentajes no excedan el 100% total por propiedad
 */