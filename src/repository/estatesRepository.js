import db from '../db/dbConnect.js';

export default class EstatesRepository {

    //obtener los inmuebles
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM estates');
        return rows;
    }
    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdown() {
        const [rows] = await db.query('SELECT id, address AS property_name FROM estates ORDER BY address ASC');
        return rows;
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda estate
    static async findByCadastralReference(cadastral_reference) {
        const [rows] = await db.query(`SELECT * FROM estates WHERE LOWER(TRIM(cadastral_reference)) = LOWER(TRIM(?))`, [cadastral_reference]);
        return rows;
    }

    //búsqueda de inmuebles con el ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM estates WHERE id = ?', [id]);
        return rows[0] || null;
    }
    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear inmuebles
    static async create(estate) {
        const {cadastral_reference, price, address, postal_code, location, province, country, surface} = estate;
        const [result] = await db.query('INSERT INTO estates (property_name, cadastral_reference, price, address, postal_code, location, province, country, surface, date_create, date_update)' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [cadastral_reference, price, address, postal_code, location, province, country, surface]);
        return result.insertId;
    }

    //actualizar usuarios
    static async update(estate) {
        const {id, cadastral_reference, price, address, postal_code, location, province, country, surface} = estate;
        const [result] = await db.query('UPDATE estates SET cadastral_reference = ?, price = ?, address = ?, postal_code = ?, location = ?, province = ?, country = ?, surface = ?, date_update = NOW() WHERE id = ?',
            [cadastral_reference, price, address, postal_code, location, province, country, surface, id]);
        return result.affectedRows;
    }

    //eliminar usuarios
    static async delete(id) {
        const [result] = await db.query('DELETE FROM estates WHERE id = ?', [id]);
        return result.affectedRows;
    }


}
