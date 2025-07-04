import db from "../db/dbConnect.js";

/**
 * Repositorio para gestionar empleados del sistema
 * Maneja todas las operaciones CRUD y búsquedas de empleados
 */
export default class EmployeeRepository {

    /**
     * Obtiene todos los empleados del sistema
     * @returns {Array} Lista completa de empleados
     */
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM employee ORDER BY id ASC');
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca empleados por nombre exacto (sin distinguir mayúsculas/minúsculas)
     * @param {string} name - Nombre a buscar
     * @returns {Array} Empleados que coinciden con el nombre
     */
    static async findByName(name) {
        const [rows] = await db.query(
            'SELECT * FROM employee WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))',
            [name]
        );
        return rows;
    }

    /**
     * Busca empleados por apellido exacto (sin distinguir mayúsculas/minúsculas)
     * @param {string} lastname - Apellido a buscar
     * @returns {Array} Empleados que coinciden con el apellido
     */
    static async findByLastname(lastname) {
        const [rows] = await db.query(
            'SELECT * FROM employee WHERE LOWER(TRIM(lastname)) = LOWER(TRIM(?))',
            [lastname]
        );
        return rows;
    }

    /**
     * Busca un empleado por identificación (NIF/NIE) - debe ser único
     * @param {string} identification - Identificación a buscar
     * @returns {Array} Empleado que coincide con la identificación
     */
    static async findByIdentification(identification) {
        const [rows] = await db.query(
            'SELECT * FROM employee WHERE LOWER(TRIM(identification)) = LOWER(TRIM(?))',
            [identification]
        );
        return rows;
    }

    /**
     * Busca un empleado por ID único
     * @param {number} id - ID del empleado
     * @returns {Array} Empleado que coincide con el ID
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM employee WHERE id = ?', [id]);
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crea un nuevo empleado en el sistema
     * @param {Object} data - Datos del empleado a crear
     * @param {string} data.name - Nombre del empleado
     * @param {string} data.lastname - Apellido del empleado
     * @param {string} data.email - Email del empleado
     * @param {string} data.identification - Identificación única (NIF/NIE)
     * @param {string} data.phone - Teléfono de contacto
     * @param {string} data.address - Dirección completa
     * @param {string} data.postal_code - Código postal
     * @param {string} data.location - Localidad/Ciudad
     * @param {string} data.province - Provincia
     * @returns {Array} Array con ID del empleado creado o array vacío si falla
     */
    static async create(data) {
        const {
            name,
            lastname,
            email,
            identification,     // Identificación única del empleado
            phone,
            address,
            postal_code,
            location,
            province,
            country,
        } = data;

        const [result] = await db.query(`
                    INSERT INTO employee(name, lastname, email, identification, phone, address,
                                         postal_code, location, province, country,
                                         date_create, date_update)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, lastname, email, identification, phone, address, postal_code, location, province, country]
        );

        // Retorna ID del empleado creado o array vacío si falló
        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza un empleado existente
     * @param {Object} data - Datos del empleado incluyendo ID
     * @param {number} data.id - ID del empleado a actualizar
     * @param {string} data.name - Nombre actualizado
     * @param {string} data.lastname - Apellido actualizado
     * @param {string} data.email - Email actualizado
     * @param {string} data.identification - Identificación actualizada
     * @param {string} data.phone - Teléfono actualizado
     * @param {string} data.address - Dirección actualizada
     * @param {string} data.postal_code - Código postal actualizado
     * @param {string} data.location - Localidad actualizada
     * @param {string} data.province - Provincia actualizada
     * @returns {Array} Array con ID del empleado actualizado o array vacío si falla
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

        const [result] = await db.query(`
                    UPDATE employee
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

        // Retorna ID del empleado actualizado o array vacío si no se encontró
        return result.affectedRows > 0 ? [{id: id, updated: true}] : [];
    }

    /**
     * Elimina un empleado por ID
     * @param {number} id - ID del empleado a eliminar
     * @returns {Array} Array con ID del empleado eliminado o array vacío si no se encontró
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM employee WHERE id = ?', [id]);

        // Retorna ID del empleado eliminado o array vacío si no se encontró
        return result.affectedRows > 0 ? [{id: id, deleted: true}] : [];
    }
}

/**
 * NOTAS IMPORTANTES:
 *
 * CAMPOS OBLIGATORIOS:
 * - name: Nombre del empleado (requerido)
 * - lastname: Apellido del empleado (requerido)
 * - identification: NIF/NIE único por empleado (requerido)
 * - email: Email de contacto (requerido)
 *
 * CAMPOS OPCIONALES:
 * - phone: Teléfono de contacto
 * - address: Dirección completa
 * - postal_code: Código postal
 * - location: Ciudad/Localidad
 * - province: Provincia
 *
 * CAMPOS AUTOMÁTICOS:
 * - id: Generado automáticamente (AUTO_INCREMENT)
 * - date_create: Fecha de creación (NOW())
 * - date_update: Fecha de última actualización (NOW())
 */