import db from '../db/dbConnect.js';

/**
 * Repositorio para gestionar clientes
 * Maneja empresas, autónomos y administradores con relaciones jerárquicas
 */
export default class ClientsRepository {

    /**
     * Obtiene todos los clientes con relaciones de empresa padre
     */
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
                   parent.company_name as parent_company_name  -- Nombre de empresa padre
            FROM clients c
                     LEFT JOIN clients parent ON c.parent_company_id = parent.id AND parent.type_client = 'empresa'
            ORDER BY c.id ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    /**
     * Para dropdowns - solo ID y nombre
     */
    static async getAllForDropdown() {
        const [rows] = await db.query('SELECT id, name FROM clients ORDER BY name ASC');
        return rows;
    }

    /**
     * Solo empresas para dropdown
     */
    static async getCompanies() {
        const [rows] = await db.query('SELECT id, company_name FROM clients WHERE type_client = ? ORDER BY company_name ASC', ['empresa']);
        return rows;
    }

    /**
     * Autónomos con sus empresas relacionadas
     */
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

    /**
     * Administradores de una empresa específica
     */
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

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca por tipo de cliente (empresa, autonomo, etc.)
     */
    static async findByType(type_client) {
        const [rows] = await db.query('SELECT * FROM clients WHERE type_client = ?', [type_client]);
        return rows;
    }

    /**
     * Busca por nombre de empresa (case-insensitive)
     */
    static async findByCompany(company_name) {
        const [rows] = await db.query('SELECT * FROM clients WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(?))', [company_name]);
        return rows;
    }

    /**
     * Búsqueda dinámica por nombre y/o apellido
     * Permite buscar solo por uno de los campos
     */
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

    /**
     * Busca por identificación (NIF/CIF) - único
     */
    static async findByIdentification(identification) {
        const [rows] = await db.query('SELECT * FROM clients WHERE LOWER(TRIM(identification)) = LOWER(TRIM(?))', [identification]);
        return rows[0] || null;
    }

    /**
     * Busca por ID único
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crea un nuevo cliente
     * @returns {Object} Cliente recién creado con todos sus datos
     */
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
            parent_company_id,      // FK a empresa padre (null para empresas independientes)
            relationship_type       // 'administrator' para admins de empresa
        } = client;
        const [result] = await db.query('INSERT INTO clients (type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type, date_create, date_update )' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?,  NOW(), NOW())',
            [type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type]);
        const insertId = result.insertId;

        // Retorna el cliente completo recién creado
        const newClient = await this.findById(insertId);
        return newClient;
    }

    /**
     * Actualiza un cliente existente
     */
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

    /**
     * Elimina un cliente
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM clients WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // ========================================
    // MÉTODOS DE CONTEO/ESTADÍSTICAS
    // ========================================

    /**
     * Cuenta facturas asociadas a un cliente
     */
    static async countBillsByClient(clientId) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM bills WHERE clients_id = ?', [clientId]);
        return rows[0].count;
    }

    /**
     * Cuenta administradores de una empresa
     */
    static async countAdministratorsByCompany(companyId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM clients WHERE parent_company_id = ? AND relationship_type = ?',
            [companyId, 'administrator']
        );
        return rows[0].count;
    }
}

/**
 * TIPOS DE CLIENTE Y RELACIONES:
 *
 * type_client:
 * - 'empresa': Empresa principal
 * - 'autonomo': Trabajador autónomo
 * - 'particular': Cliente particular
 *
 * relationship_type:
 * - 'administrator': Administrador de empresa
 * - null: Cliente independiente
 *
 * parent_company_id:
 * - null: Cliente independiente/empresa principal
 * - ID: Referencia a empresa padre (para administradores)
 */