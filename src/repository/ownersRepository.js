import db from '../db/dbConnect.js';

export default class OwnersRepository {

    //obtener los datos del usuario
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM owners');
        return rows;
    }

    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdown() {
        const [rows] = await db.query('SELECT id, name FROM owners ORDER BY name ASC');
        return rows;
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por nombre //LOWER = mayúsculas o minúsculas TRIM = espacios
    static async findByName(name) {
        const [rows] = await db.query(`SELECT * FROM owners WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))`, [name]);
        return rows;
    }

    //búsqueda por apellidos
    static async findByLastname(lastname) {
        const [rows] = await db.query('SELECT * FROM owners WHERE LOWER(TRIM(lastname)) = LOWER(TRIM(?))', [lastname]);
        return rows;
    }

    //búsqueda por nif
    static async findByIdentification(identification) {
        const [rows] = await db.query('SELECT * FROM owners WHERE LOWER(TRIM(identification)) = LOWER(TRIM(?))', [identification]);
        return rows[0] || null;
    }

    //búsqueda por ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM owners WHERE id = ?', [id]);
        return rows[0] || null;
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear usuario
    static async create(data) {
        const {name, lastname, email, identification, phone, address, postal_code, location, province, country} = data;
        const [result] = await db.query('INSERT INTO owners (name, lastname, email, identification, phone, address, postal_code, location, province, country, date_create, date_update )' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [name, lastname, email, identification, phone, address, postal_code, location, province, country]);
        return result.insertId;
    }

    //actualizar usuarios
    static async update(data) {
        const {id, name, lastname, email, identification, phone, address, postal_code, location, province, country} = data;
        const [result] = await db.query('UPDATE owners SET  name = ?, lastname = ?, email = ?, identification = ?, phone = ?, address = ?, postal_code = ?, location = ?, province = ?, country = ?, date_update = NOW() WHERE id = ?',
            [name, lastname, email, identification, phone, address, postal_code, location, province, country, id]);
        return result.affectedRows;
    }

    //eliminar usuarios
    static async delete(id) {
        const [result] = await db.query('DELETE FROM owners WHERE id = ?', [id]);
        return result.affectedRows;
    }


}
