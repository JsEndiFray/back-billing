import db from '../db/dbConnect.js';

export default class TaxesRepository {

    //obtener las facturas
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM taxes');
        return rows;
    }

    //MÉTODOS DE BÚSQUEDAS
    //búsqueda por ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM taxes WHERE id = ?', [id]);
        return rows[0];
    }

    //búsqueda por numero de factura
    static async findByBillNumber(bill_number) {
        const [rows] = await db.query('SELECT * FROM taxes WHERE bill_number = ?', [bill_number]);
        return rows;
    }
    //búsqueda por id_owners
    static async findByOwnersId(ownersId) {
        const [rows] = await db.query('SELECT * FROM taxes WHERE users_id = ?', [ownersId]);
        return rows;
    }
    //búsqueda por id_cliente
    static async findByClientId(clientId) {
        const [rows] = await db.query('SELECT * FROM taxes WHERE clients_id = ?', [clientId]);
        return rows;
    }
    //BÚSQUEDA HISTORIAL FACTURA POR NIF
    // búsqueda por NIF del cliente
    static async findByClientNif(nif) {
        const [rows] = await db.query(`SELECT taxes.* FROM taxes JOIN clients ON taxes.clients_id = clients.id WHERE clients.identification = ?`,
            [nif]
        );
        return rows;
    }


    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear FACTURAS
    static async create(taxes) {
        const {bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total} = taxes;
        const [result] = await db.query('INSERT INTO taxes (bill_number, users_id, clients_id, date, tax_base, iva, irpf, total, date_create, date_update)' +
            ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',[bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total]);
        return result.insertId;
    }
    //actualizar FACTURAS
    static async update(taxes) {
        const {id, bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total} = taxes;
        const [result] = await db.query(
            `UPDATE taxes SET bill_number = ?, users_id = ?, clients_id = ?,date = ?,tax_base = ?,iva = ?,irpf = ?,total = ?, date_update = NOW() WHERE id = ?`,
            [bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total, id]);
        return result.affectedRows;
    }
    //ELIMINAR FACTURAS
    static async delete(id) {
        const [result] = await db.query('DELETE FROM taxes WHERE id = ?', [id]);
        return result.affectedRows;
    }
}