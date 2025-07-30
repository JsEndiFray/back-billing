import db from '../db/dbConnect.js';

/**
 * Repositorio para manejar proveedores
 * Gestiona la tabla suppliers para facturas recibidas
 */
export default class SuppliersRepository {

    /**
     * Obtiene todos los proveedores activos
     */
    static async getAll() {
        const [rows] = await db.query(`
            SELECT s.id,
                   s.name,
                   s.company_name,
                   s.tax_id,
                   s.address,
                   s.postal_code,
                   s.city,
                   s.province,
                   s.country,
                   s.phone,
                   s.email,
                   s.contact_person,
                   s.payment_terms,
                   s.bank_account,
                   s.notes,
                   s.active,
                   s.created_at,
                   s.updated_at
            FROM suppliers s
            WHERE s.active = TRUE
            ORDER BY s.name ASC
        `);
        return rows;
    }

    /**
     * Obtiene todos los proveedores (activos e inactivos)
     */
    static async getAllIncludingInactive() {
        const [rows] = await db.query(`
            SELECT s.*
            FROM suppliers s
            ORDER BY s.active DESC, s.name ASC
        `);
        return rows;
    }

    /**
     * Busca un proveedor por ID
     * @param {number} id - ID del proveedor
     */
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT s.*
            FROM suppliers s
            WHERE s.id = ?
        `, [id]);
        return rows;
    }

    /**
     * Busca un proveedor por Tax ID (CIF/NIF)
     * @param {string} taxId - CIF/NIF del proveedor
     */
    static async findByTaxId(taxId) {
        const [rows] = await db.query(`
            SELECT s.*
            FROM suppliers s
            WHERE s.tax_id = ?
        `, [taxId]);
        return rows;
    }

    /**
     * Busca proveedores por nombre (búsqueda parcial)
     * @param {string} name - Nombre a buscar
     */
    static async findByName(name) {
        const [rows] = await db.query(`
            SELECT s.*
            FROM suppliers s
            WHERE (s.name LIKE ? OR s.company_name LIKE ?)
              AND s.active = TRUE
            ORDER BY s.name ASC
        `, [`%${name}%`, `%${name}%`]);
        return rows;
    }

    /**
     * Crea un nuevo proveedor
     * @param {Object} supplierData - Datos del proveedor
     */
    static async create(supplierData) {
        const {
            name,
            company_name = null,
            tax_id,
            address = null,
            postal_code = null,
            city = null,
            province = null,
            country = 'España',
            phone = null,
            email = null,
            contact_person = null,
            payment_terms = 30,
            bank_account = null,
            notes = null,
            active = true
        } = supplierData;

        const [result] = await db.query(`
            INSERT INTO suppliers 
            (name, company_name, tax_id, address, postal_code, city, province, country,
             phone, email, contact_person, payment_terms, bank_account, notes, active,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            name, company_name, tax_id, address, postal_code, city, province, country,
            phone, email, contact_person, payment_terms, bank_account, notes, active
        ]);

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza un proveedor existente
     * @param {number} id - ID del proveedor
     * @param {Object} supplierData - Nuevos datos del proveedor
     */
    static async update(id, supplierData) {
        const {
            name,
            company_name,
            tax_id,
            address,
            postal_code,
            city,
            province,
            country,
            phone,
            email,
            contact_person,
            payment_terms,
            bank_account,
            notes,
            active
        } = supplierData;

        const [result] = await db.query(`
            UPDATE suppliers
            SET name = ?,
                company_name = ?,
                tax_id = ?,
                address = ?,
                postal_code = ?,
                city = ?,
                province = ?,
                country = ?,
                phone = ?,
                email = ?,
                contact_person = ?,
                payment_terms = ?,
                bank_account = ?,
                notes = ?,
                active = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [
            name, company_name, tax_id, address, postal_code, city, province, country,
            phone, email, contact_person, payment_terms, bank_account, notes, active,
            id
        ]);

        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina un proveedor (borrado lógico)
     * @param {number} id - ID del proveedor
     */
    static async delete(id) {
        // Borrado lógico - marcamos como inactivo
        const [result] = await db.query(`
            UPDATE suppliers
            SET active = FALSE,
                updated_at = NOW()
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }

    /**
     * Elimina físicamente un proveedor (solo si no tiene facturas asociadas)
     * @param {number} id - ID del proveedor
     */
    static async hardDelete(id) {
        // TODO: Verificar que no tenga facturas recibidas asociadas
        // Esto se implementará cuando tengamos la tabla invoices_received

        const [result] = await db.query(`
            DELETE FROM suppliers
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0 ? [{id: Number(id), hardDeleted: true}] : [];
    }

    /**
     * Reactiva un proveedor inactivo
     * @param {number} id - ID del proveedor
     */
    static async activate(id) {
        const [result] = await db.query(`
            UPDATE suppliers
            SET active = TRUE,
                updated_at = NOW()
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0 ? [{id: Number(id), activated: true}] : [];
    }

    /**
     * Obtiene estadísticas de proveedores
     */
    static async getStats() {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_suppliers,
                SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) as active_suppliers,
                SUM(CASE WHEN active = FALSE THEN 1 ELSE 0 END) as inactive_suppliers
            FROM suppliers
        `);
        return rows[0] || {};
    }

    /**
     * Busca proveedores con términos de pago específicos
     * @param {number} paymentTerms - Días de pago
     */
    static async findByPaymentTerms(paymentTerms) {
        const [rows] = await db.query(`
            SELECT s.*
            FROM suppliers s
            WHERE s.payment_terms = ?
              AND s.active = TRUE
            ORDER BY s.name ASC
        `, [paymentTerms]);
        return rows;
    }
}