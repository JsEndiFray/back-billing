import db from '../db/dbConnect.js';

export default class BillsRepository {

    //obtener las facturas
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM bills');
        return rows;
    }

    //MÉTODOS DE BÚSQUEDAS
    //búsqueda por ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM bills WHERE id = ?', [id]);
        return rows[0] || null;
    }

    //búsqueda por numero de factura
    static async findByBillNumber(bill_number) {
        const [rows] = await db.query('SELECT * FROM bills WHERE bill_number = ?', [bill_number]);
        return rows[0] || null;
    }
    //búsqueda por id_owners
    static async findByOwnersId(ownersId) {
        const [rows] = await db.query('SELECT * FROM bills WHERE owners_id = ?', [ownersId]);
        return rows;
    }
    //búsqueda por id_cliente
    static async findByClientId(clientId) {
        const [rows] = await db.query('SELECT * FROM bills WHERE clients_id = ?', [clientId]);
        return rows;
    }
    //BÚSQUEDA HISTORIAL FACTURA POR NIF
    // búsqueda por NIF del cliente
    static async findByClientNif(nif) {
        const [rows] = await db.query(
            `SELECT bills.* FROM bills JOIN clients ON bills.clients_id = clients.id WHERE clients.identification = ?`,
            [nif]
        );
        return rows;
    }
    //Busca facturas que tienen mismo owner + estate.
    static async findByOwnersAndEstate(ownersId, estateId) {
        const [rows] = await db.query(
            `SELECT * FROM bills WHERE owners_id = ? AND estate_id = ?`,
            [ownersId, estateId]
        );
        return rows;
    }


    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //buscar el último número de factura
    static async getLastBillNumber() {
        const [rows] = await db.query(
            `SELECT bill_number FROM bills ORDER BY id DESC LIMIT 1`
        );
        return rows[0]?.bill_number || null;
    }

    //crear FACTURAS
    static async create(bill) {
        const {bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total} = bill;
        const [result] = await db.query('INSERT INTO bills (bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, date_create, date_update)' +
            ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',[bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total]);
        return result.insertId;
    }
    //actualizar FACTURAS
    static async update(bill) {
        const {id, bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total} = bill;
        const [result] = await db.query(
            `UPDATE bills SET bill_number = ?, owners_id = ?, clients_id = ?,date = ?,tax_base = ?,iva = ?,irpf = ?,total = ?, date_update = NOW() WHERE id = ?`,
            [bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total, id]);
        return result.affectedRows;
    }
    //ELIMINAR FACTURAS
    static async delete(id) {
        const [result] = await db.query('DELETE FROM bills WHERE id = ?', [id]);
        return result.affectedRows;
    }
}