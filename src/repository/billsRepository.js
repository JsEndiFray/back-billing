import db from '../db/dbConnect.js';

export default class BillsRepository {

    //obtener las facturas
    static async getAll() {
        const [rows] = await db.query(`
        SELECT 
            b.id,
            b.bill_number,
            b.ownership_percent,
            b.date,
            b.tax_base,
            b.iva,
            b.irpf,
            b.total,
            b.date_create,
            b.date_update,
            e.address AS estate_name,
            o.name AS owner_name,
            c.name AS client_name
        FROM bills b
        JOIN estates e ON b.estate_id = e.id
        JOIN owners o ON b.owners_id = o.id
        JOIN clients c ON b.clients_id = c.id
        ORDER BY b.date DESC
    `);
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
        const {bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent} = bill;
        // Añadir is_refund y original_bill_id con valores por defecto
        const [result] = await db.query('INSERT INTO bills (bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent, is_refund, original_bill_id, date_create, date_update)' +
            ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, NULL, NOW(), NOW())',
            [bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent]);
        return result.insertId;
    }
    //actualizar FACTURAS
    static async update(bill) {
        const {id, bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent} = bill;
        const [result] = await db.query(
            `UPDATE bills SET bill_number = ?, owners_id = ?, clients_id = ?, date = ?, tax_base = ?, iva = ?, irpf = ?, total = ?, ownership_percent = ?, date_update = NOW() WHERE id = ?`,
            [bill_number, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent, id]);
        return result.affectedRows;
    }
    //ELIMINAR FACTURAS
    static async delete(id) {
        const [result] = await db.query('DELETE FROM bills WHERE id = ?', [id]);
        return result.affectedRows;
    }

    //NUEVOS METODOS DE INCORPORACION

    //--------------------------------------------------------------------------------------------


    // DESCARGA FACTURAS
    static async findByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
            SELECT 
                b.*, 
                c.name as client_name, 
                c.lastname as client_lastname, 
                c.identification as client_identification, 
                c.company_name as client_company_name,
                c.address as client_address,
                c.postal_code as client_postal_code,
                c.location as client_location,
                c.province as client_province,
                c.country as client_country,
                c.type_client as client_type,
                
                e.cadastral_reference as estate_reference_cadastral, 
                e.address as estate_address,
                
                o.name as owner_name, 
                o.lastname as owner_lastname, 
                o.nif as owner_identification,
                o.address as owner_address,
                o.postal_code as owner_postal_code,
                o.location as owner_location,
                o.province as owner_province,
                o.country as owner_country
            FROM bills b
            LEFT JOIN clients c ON b.clients_id = c.id
            LEFT JOIN estates e ON b.estate_id = e.id
            LEFT JOIN owners o ON b.owners_id = o.id
            WHERE b.id = ?
        `, [id]);

            return rows[0];
        } catch (error) {
            console.error('Error en findByIdWithDetails:', error);
            throw error;
        }
    }

    // Crear un abono
    static async createRefund(bill) {
        const {bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent, original_bill_id} = bill;
        const [result] = await db.query('INSERT INTO bills (bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent, is_refund, original_bill_id, date_create, date_update)' +
            ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, NOW(), NOW())',
            [bill_number, estate_id, owners_id, clients_id, date, tax_base, iva, irpf, total, ownership_percent, original_bill_id]);
        return result.insertId;
    }

    // Buscar el último número de abono
    static async getLastRefundNumber() {
        const [rows] = await db.query(
            `SELECT bill_number FROM bills WHERE is_refund = TRUE ORDER BY id DESC LIMIT 1`
        );
        return rows[0]?.bill_number || null;
    }

    // Obtener todos los abonos
    static async getAllRefunds() {
        const [rows] = await db.query(`
        SELECT 
            b.id,
            b.bill_number,
            b.ownership_percent,
            b.date,
            b.tax_base,
            b.iva,
            b.irpf,
            b.total,
            b.date_create,
            b.date_update,
            b.original_bill_id,
            e.address AS estate_name,
            o.name AS owner_name,
            c.name AS client_name,
            ob.bill_number AS original_bill_number
        FROM bills b
        JOIN estates e ON b.estate_id = e.id
        JOIN owners o ON b.owners_id = o.id
        JOIN clients c ON b.clients_id = c.id
        LEFT JOIN bills ob ON b.original_bill_id = ob.id
        WHERE b.is_refund = TRUE
        ORDER BY b.date DESC
    `);
        return rows;
    }

    // Obtener un abono con todos sus detalles
    static async findRefundByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
            SELECT 
                b.*, 
                c.name as client_name, 
                c.lastname as client_lastname, 
                c.identification as client_identification, 
                c.company_name as client_company_name,
                c.address as client_address,
                c.postal_code as client_postal_code,
                c.location as client_location,
                c.province as client_province,
                c.country as client_country,
                c.type_client as client_type,
                
                e.cadastral_reference as estate_reference_cadastral, 
                e.address as estate_address,
                
                o.name as owner_name, 
                o.lastname as owner_lastname, 
                o.nif as owner_identification,
                o.address as owner_address,
                o.postal_code as owner_postal_code,
                o.location as owner_location,
                o.province as owner_province,
                o.country as owner_country,
                
                ob.bill_number as original_bill_number
            FROM bills b
            LEFT JOIN clients c ON b.clients_id = c.id
            LEFT JOIN estates e ON b.estate_id = e.id
            LEFT JOIN owners o ON b.owners_id = o.id
            LEFT JOIN bills ob ON b.original_bill_id = ob.id
            WHERE b.id = ? AND b.is_refund = TRUE
        `, [id]);

            return rows[0];
        } catch (error) {
            console.error('Error en findRefundByIdWithDetails:', error);
            throw error;
        }
    }

}