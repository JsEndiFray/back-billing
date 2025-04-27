import db from '../db/dbConnect.js';

export default class EstateRepository {

    //obtener los inmuebles
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM estates');
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
        return rows[0];
    }
    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear inmuebles
    static async create(estate) {
        const {cadastral_reference, price, address, postal_code, location, province, surface} = estate;
        const [result] = await db.query('INSERT INTO estates (cadastral_reference, price, address, postal_code, location, province, surface, date_create, date_update)' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [cadastral_reference, price, address, postal_code, location, province, surface]);
        return result.insertId;
    }

    //actualizar usuarios
    static async update(estate) {
        const {id, cadastral_reference,  price, address, postal_code, location, province, surface } = estate;
        const [result] = await db.query('UPDATE estates SET cadastral_reference = ?, price = ? , address = ?, postal_code = ?, location = ?, province = ?, surface = ?, date_update = NOW() WHERE id = ?',
            [cadastral_reference, price, address, postal_code, location, province, surface, id]
        );
        return result.affectedRows;
    }

    //eliminar usuarios
    static async delete(id) {
        const [result] = await db.query('DELETE FROM estates WHERE id = ?', [id]);
        return result.affectedRows;
    }


}

