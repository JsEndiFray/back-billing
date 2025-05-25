import db from '../db/dbConnect.js';

export default class UsersRepository {

    //obtener todos los usuarios registrados
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM users ORDER BY name ASC');
        return rows;
    }

    //métodos de búsquedas

    //búsqueda por username
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', username);
        return rows[0] || null;
    }

    //búsqueda por email
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', email);
        return rows[0] || null;
    }

    //búsqueda por phone
    static async findByPhone(phone) {
        const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', phone);
        return rows[0] || null;
    }

    //búsqueda por ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    //MÉTODOS CREATE UPDATE DELETE

    //crear el usuario
    static async create(user) {
        const {username, password, email, phone, role} = user;
        const [result] = await db.query('INSERT INTO users (username, password, email, phone, role, date_create, date_update)' +
            'VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [username, password, email, phone, role]);
        return result.insertId;
    }

    //update el usuario
    static async update(user) {
        const {id, username, password, email, phone, role} = user;
        const [result] = await db.query('UPDATE users SET username = ?, password = ?, email = ?, phone = ?, role = ?, date_update = NOW() WHERE id = ? ',
            [username, password, email, phone, role, id]);
        return result.affectedRows;
    }

    //delete el usuario
    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE ID = ?', [id]);
        return result.affectedRows;
    }


}