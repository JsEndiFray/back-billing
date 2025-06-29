import db from "../db/dbConnect.js";

/**
 * Repositorio para gestionar empleados del sistema
 */
export default class EmployeeRepository {
    /**
     * Obtiene todos los empleados
     */
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM employee');
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca empleados por nombre exacto (sin distinguir mayúsculas/minúsculas)
     */
    static async finByName(name) {
        const [rows] = await db.query('SELECT * FROM employee WHERE LOWER(TRIM(name))= LOWER(TRIM(?))', [name]);
        return rows;
    }

    /**
     * Busca empleados por apellidos exacto (sin distinguir mayúsculas/minúsculas)
     */
    static async findByLastname(lastname) {
        const [rows] = await db.query('SELECT * FROM employee WHERE LOWER(TRIM(lastname)) = LOWER(TRIM(?))', [lastname]);
        return rows;

    }

    /**
     * Busca un empleadop por identificación (NIF/NIE)
     */
    static async findByIdentification(identification) {
        const [rows] = await db.query('SELECT * FROM employee WHERE LOWER(TRIM(identification)) = LOWER(TRIM(?))', [identification]);
        return rows;
    }

    /**
     * Busca un empleado por ID único
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM employee WHERE id = ?', [id]);
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================
    /**
     * Crea nuevo empleado
     * @returns {number} ID del empleado creado
     */
    static async create(data) {
        const {name, lastname, email, identication, phone, address, postal_code, location, province, country} = data;
        const [result] = await db.query(`INSERT INTO employee(name, lastname, email, identication, phone, address,
                                                              postal_code, location, province,
                                                              country, date_create, date_update)
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),
                                                 NOW())`, [name, lastname, email, identication, phone, address, postal_code, location, province, country]);
        return result.insertId;
    }

    /**
     * Actualiza empleado existente
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
            `UPDATE employee
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
        return result.affectedRows;
    }

    /**
     * Elimina empleado por ID
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM employee WHERE id = ?', [id]);
        return result.affectedRows;
    }


}