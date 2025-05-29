import db from '../db/dbConnect.js';

export default class ClientsRepository {

    //obtener los datos de los clientes
    static async getAll() {
        const query = `
            SELECT c.id,
                   c.type_client,
                   c.name,
                   c.lastname,
                   c.company_name,
                   c.identification,
                   c.phone,
                   c.email,
                   c.address,
                   c.postal_code,
                   c.location,
                   c.province,
                   c.country,
                   c.date_create,
                   c.date_update,
                   c.parent_company_id,
                   c.relationship_type,
                   parent.company_name as parent_company_name
            FROM clients c
                     LEFT JOIN clients parent ON c.parent_company_id = parent.id AND parent.type_client = 'empresa'
            ORDER BY c.id ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdown() {
        const [rows] = await db.query('SELECT id, name FROM clients ORDER BY name ASC');
        return rows;
    }

    //Obtener solo empresas para dropdown
    static async getCompanies() {
        const [rows] = await db.query('SELECT id, company_name FROM clients WHERE type_client = ? ORDER BY company_name ASC', ['empresa']);
        return rows;
    }

    //Obtener autónomos con sus empresas relacionadas
    static async getAutonomsWithCompanies() {
        const [rows] = await db.query(`
            SELECT a.*,
                   c.company_name as related_company_name
            FROM clients a
                     LEFT JOIN clients c ON a.parent_company_id = c.id
            WHERE a.type_client = ?
            ORDER BY a.id DESC
        `, ['autonomo']);
        return rows;
    }

    //Obtener administradores de una empresa específica
    static async getAdministratorsByCompany(companyId) {
        const [rows] = await db.query(`
            SELECT *
            FROM clients
            WHERE parent_company_id = ?
              AND relationship_type = ?
            ORDER BY name ASC
        `, [companyId, 'administrator']);
        return rows;
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por tipo de cliente.
    static async findByType(type_client) {
        const [rows] = await db.query('SELECT * FROM clients WHERE type_client = ?', [type_client]);
        return rows;
    }

    //búsqueda por nombre de empresa.
    static async findByCompany(company_name) {
        const [rows] = await db.query('SELECT * FROM clients WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(?))', [company_name]);
        return rows;
    }

    //búsqueda por nombre y apellido
    static async findByNameOrLastname(name, lastname) {
        let query = 'SELECT * FROM clients WHERE 1=1';
        const values = [];

        if (name) {
            query += ' AND LOWER(TRIM(name)) = LOWER(TRIM(?))';
            values.push(name);
        }

        if (lastname) {
            query += ' AND LOWER(TRIM(lastname)) = LOWER(TRIM(?))';
            values.push(lastname);
        }

        const [rows] = await db.query(query, values);
        return rows;
    }

    //búsqueda por identificación
    static async findByIdentification(identification) {
        const [rows] = await db.query('SELECT * FROM clients WHERE LOWER(TRIM(identification)) = LOWER(TRIM(?))', [identification]);
        return rows[0] || null;
    }

    //búsqueda por ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
        return rows[0] || null;
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear usuario
    static async create(client) {
        const {
            type_client,
            name,
            lastname,
            company_name,
            identification,
            phone,
            email,
            address,
            postal_code,
            location,
            province,
            country,
            parent_company_id,
            relationship_type
        } = client;
        const [result] = await db.query('INSERT INTO clients (type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type, date_create, date_update )' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?,  NOW(), NOW())',
            [type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type]);
        const insertId = result.insertId;
        // Obtener el cliente recién creado
        const newClient = await this.findById(insertId);
        return newClient;

    }

    //actualizar clientes
    static async update(client) {
        const {
            id,
            type_client,
            name,
            lastname,
            company_name,
            identification,
            phone,
            email,
            address,
            postal_code,
            location,
            province,
            country,
            parent_company_id,
            relationship_type
        } = client;
        const [result] = await db.query('UPDATE clients SET type_client = ?, name = ?, lastname = ?, company_name = ?, identification = ?, phone = ?, email = ?, address = ?, postal_code = ?, location = ?, province = ?, country = ?, parent_company_id = ?, relationship_type = ?, date_update = NOW() WHERE id = ?',
            [type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type, id]
        );
        return result.affectedRows;
    }

    //eliminar usuarios
    static async delete(id) {
        const [result] = await db.query('DELETE FROM clients WHERE id = ?', [id]);
        return result.affectedRows;
    }


    //metodos de conteo relacionado con facturas y empresas

    // Devuelve el número total de facturas asociadas a un cliente
    static async countBillsByClient(clientId) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM bills WHERE clients_id = ?', [clientId]);
        return rows[0].count;
    }

    //Cuenta el número de administradores dentro de una empresa.
    static async countAdministratorsByCompany(companyId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM clients WHERE parent_company_id = ? AND relationship_type = ?',
            [companyId, 'administrator']
        );
        return rows[0].count;
    }


}
