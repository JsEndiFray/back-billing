import db from '../db/dbConnect.js';

/**
 * Repositorio para manejar facturas recibidas de proveedores
 * Gestiona la tabla invoices_received con relaciones a suppliers
 */
export default class InvoicesReceivedRepository {

    /**
     * Obtiene todas las facturas recibidas con información del proveedor
     */
    static async getAll() {
        const [rows] = await db.query(`
            SELECT ir.id,
                   ir.invoice_number,
                   ir.our_reference,
                   ir.supplier_id,
                   ir.property_id,
                   ir.invoice_date,
                   ir.due_date,
                   ir.received_date,
                   ir.tax_base,
                   ir.iva_percentage,
                   ir.iva_amount,
                   ir.irpf_percentage,
                   ir.irpf_amount,
                   ir.total_amount,
                   ir.category,
                   ir.subcategory,
                   ir.description,
                   ir.notes,
                   ir.collection_status,
                   ir.collection_method,
                   ir.collection_date,
                   ir.collection_reference,
                   ir.collection_notes,
                   ir.start_date,
                   ir.end_date,
                   ir.corresponding_month,
                   ir.is_proportional,
                   ir.is_refund,
                   ir.original_invoice_id,
                   ir.pdf_path,
                   ir.has_attachments,
                   ir.created_at,
                   ir.updated_at,
                   -- Datos del proveedor
                   s.name AS supplier_name,
                   s.company_name AS supplier_company,
                   s.tax_id AS supplier_tax_id,
                   -- Factura original (para abonos)
                   orig.invoice_number AS original_invoice_number
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            LEFT JOIN invoices_received orig ON ir.original_invoice_id = orig.id
            ORDER BY ir.id ASC
        `);
        return rows;
    }

    /**
     * Busca una factura por ID
     */
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company,
                   s.tax_id AS supplier_tax_id,
                   s.payment_terms AS supplier_payment_terms
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.id = ?
        `, [id]);
        return rows;
    }

    /**
     * Busca facturas por número de factura del proveedor
     */
    static async findByInvoiceNumber(invoiceNumber) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.invoice_number = ?
        `, [invoiceNumber]);
        return rows;
    }

    /**
     * Busca facturas por proveedor
     */
    static async findBySupplierId(supplierId) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.supplier_id = ?
            ORDER BY ir.invoice_date DESC
        `, [supplierId]);
        return rows;
    }

    /**
     * Busca facturas por categoría
     */
    static async findByCategory(category) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.category = ?
            ORDER BY ir.invoice_date DESC
        `, [category]);
        return rows;
    }

    /**
     * Busca facturas por rango de fechas
     */
    static async findByDateRange(startDate, endDate) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.invoice_date BETWEEN ? AND ?
            ORDER BY ir.invoice_date DESC
        `, [startDate, endDate]);
        return rows;
    }

    /**
     * Busca facturas por estado de pago
     */
    static async findByPaymentStatus(status) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.collection_status = ?
            ORDER BY ir.due_date ASC, ir.invoice_date DESC
        `, [status]);
        return rows;
    }

    /**
     * Busca facturas vencidas (overdue)
     */
    static async findOverdueInvoices() {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company,
                   DATEDIFF(CURRENT_DATE, ir.due_date) AS days_overdue
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.collection_status = 'pending' 
              AND ir.due_date < CURRENT_DATE
            ORDER BY ir.due_date ASC
        `);
        return rows;
    }

    /**
     * Busca facturas próximas a vencer
     */
    static async findDueSoon(days = 7) {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company,
                   DATEDIFF(ir.due_date, CURRENT_DATE) AS days_until_due
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            WHERE ir.collection_status = 'pending' 
              AND ir.due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
            ORDER BY ir.due_date ASC
        `, [days]);
        return rows;
    }

    /**
     * Crea una nueva factura recibida
     */
    static async create(invoiceData) {
        const {
            invoice_number,
            our_reference = null,
            supplier_id,
            property_id = null,
            invoice_date,
            due_date = null,
            received_date = null,
            tax_base,
            iva_percentage = 21.00,
            iva_amount,
            irpf_percentage = 0.00,
            irpf_amount = 0.00,
            total_amount,
            category = 'otros',
            subcategory = null,
            description,
            notes = null,
            collection_status = 'pending',
            collection_method = 'transfer',
            collection_date = null,
            collection_reference = null,
            collection_notes = null,
            start_date = null,
            end_date = null,
            corresponding_month = null,
            is_proportional = false,
            pdf_path = null,
            has_attachments = false,
            created_by = null
        } = invoiceData;

        const [result] = await db.query(`
            INSERT INTO invoices_received 
            (invoice_number, our_reference, supplier_id, property_id, invoice_date, due_date, received_date,
             tax_base, iva_percentage, iva_amount, irpf_percentage, irpf_amount, total_amount,
             category, subcategory, description, notes,
             collection_status, collection_method, collection_date, collection_reference, collection_notes,
             start_date, end_date, corresponding_month, is_proportional,
             is_refund, original_invoice_id, pdf_path, has_attachments, created_by,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                    FALSE, NULL, ?, ?, ?, NOW(), NOW())
        `, [
            invoice_number, our_reference, supplier_id, property_id, invoice_date, due_date, received_date,
            tax_base, iva_percentage, iva_amount, irpf_percentage, irpf_amount, total_amount,
            category, subcategory, description, notes,
            collection_status, collection_method, collection_date,collection_reference, collection_notes,
            start_date, end_date, corresponding_month, is_proportional,
            pdf_path, has_attachments, created_by
        ]);

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza una factura recibida
     */
    static async update(id, invoiceData) {
        const {
            invoice_number,
            our_reference,
            supplier_id,
            property_id,
            invoice_date,
            due_date,
            received_date,
            tax_base,
            iva_percentage,
            iva_amount,
            irpf_percentage,
            irpf_amount,
            total_amount,
            category,
            subcategory,
            description,
            notes,
            collection_status,
            collection_method,
            collection_date,
            collection_reference,
            collection_notes,
            start_date,
            end_date,
            corresponding_month,
            is_proportional,
            pdf_path,
            has_attachments
        } = invoiceData;

        const [result] = await db.query(`
            UPDATE invoices_received
            SET invoice_number = ?,
                our_reference = ?,
                supplier_id = ?,
                property_id = ?,
                invoice_date = ?,
                due_date = ?,
                received_date = ?,
                tax_base = ?,
                iva_percentage = ?,
                iva_amount = ?,
                irpf_percentage = ?,
                irpf_amount = ?,
                total_amount = ?,
                category = ?,
                subcategory = ?,
                description = ?,
                notes = ?,
                collection_status = ?,
                collection_method = ?,
                collection_date = ?,
                collection_reference = ?,
                collection_notes = ?,
                start_date = ?,
                end_date = ?,
                corresponding_month = ?,
                is_proportional = ?,
                pdf_path = ?,
                has_attachments = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [
            invoice_number, our_reference, supplier_id, property_id, invoice_date, due_date, received_date,
            tax_base, iva_percentage, iva_amount, irpf_percentage, irpf_amount, total_amount,
            category, subcategory, description, notes,
            collection_status, collection_method, collection_date, collection_reference, collection_notes,
            start_date, end_date, corresponding_month, is_proportional,
            pdf_path, has_attachments,
            id
        ]);

        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina una factura recibida
     */
    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM invoices_received WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }

    /**
     * Actualiza solo el estado de pago
     */
    static async updatePaymentStatus(id, paymentData) {
        const { collection_status, collection_method, collection_date, collection_reference,collection_notes } = paymentData;

        const [result] = await db.query(`
            UPDATE invoices_received
            SET collection_status = ?,
                collection_method = ?,
                collection_date = ?,
                collection_reference = ?,
                collection_notes = ?,
                updated_at = NOW()
            WHERE id = ?
        `, [collection_status, collection_method, collection_date, collection_reference, collection_notes, id]);

        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Obtiene todas las facturas que son abonos
     */
    static async getAllRefunds() {
        const [rows] = await db.query(`
            SELECT ir.*,
                   s.name AS supplier_name,
                   s.company_name AS supplier_company,
                   orig.invoice_number AS original_invoice_number
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            LEFT JOIN invoices_received orig ON ir.original_invoice_id = orig.id
            WHERE ir.is_refund = TRUE
            ORDER BY ir.invoice_date DESC
        `);
        return rows;
    }

    /**
     * Crea un abono basado en una factura original
     */
    static async createRefund(refundData) {
        const {
            invoice_number,
            supplier_id,
            property_id,
            invoice_date,
            tax_base,
            iva_percentage,
            iva_amount,
            irpf_percentage,
            irpf_amount,
            total_amount,
            category,
            subcategory,
            description,
            notes,
            original_invoice_id,
            start_date,
            end_date,
            corresponding_month,
            is_proportional,
            created_by
        } = refundData;

        const [result] = await db.query(`
            INSERT INTO invoices_received 
            (invoice_number, supplier_id, property_id, invoice_date,
             tax_base, iva_percentage, iva_amount, irpf_percentage, irpf_amount, total_amount,
             category, subcategory, description, notes,
             is_refund, original_invoice_id,
             start_date, end_date, corresponding_month, is_proportional,
             collection_status, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
        `, [
            invoice_number, supplier_id, property_id, invoice_date,
            tax_base, iva_percentage, iva_amount, irpf_percentage, irpf_amount, total_amount,
            category, subcategory, description, notes,
            original_invoice_id,
            start_date, end_date, corresponding_month, is_proportional,
            created_by
        ]);

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Obtiene el último número de referencia interna
     */
    static async getLastOurReference() {
        const [rows] = await db.query(`
            SELECT our_reference
            FROM invoices_received
            WHERE our_reference LIKE 'FR-%'
            ORDER BY id DESC LIMIT 1
        `);
        return rows;
    }

    /**
     * Obtiene estadísticas de facturas recibidas
     */
    static async getStats() {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_invoices,
                SUM(CASE WHEN collection_status = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
                SUM(CASE WHEN collection_status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
                SUM(CASE WHEN collection_status = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices,
                SUM(CASE WHEN is_refund = FALSE THEN total_amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN is_refund = FALSE THEN iva_amount ELSE 0 END) as total_iva,
                SUM(CASE WHEN collection_status = 'pending' AND is_refund = FALSE THEN total_amount ELSE 0 END) as pending_amount
            FROM invoices_received
        `);
        return rows[0] || {};
    }

    /**
     * Obtiene resumen por categoría
     */
    static async getStatsByCategory() {
        const [rows] = await db.query(`
            SELECT 
                category,
                COUNT(*) as invoice_count,
                SUM(CASE WHEN is_refund = FALSE THEN total_amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN is_refund = FALSE THEN iva_amount ELSE 0 END) as total_iva
            FROM invoices_received
            WHERE is_refund = FALSE
            GROUP BY category
            ORDER BY total_amount DESC
        `);
        return rows;
    }

    /**
     * Obtiene facturas para el libro de IVA soportado
     */
    static async getForVATBook(year, month = null) {
        let whereClause = 'WHERE YEAR(ir.invoice_date) = ?';
        let params = [year];

        if (month) {
            whereClause += ' AND MONTH(ir.invoice_date) = ?';
            params.push(month);
        }

        const [rows] = await db.query(`
            SELECT ir.invoice_date,
                   ir.invoice_number,
                   s.name AS supplier_name,
                   s.tax_id AS supplier_tax_id,
                   ir.tax_base,
                   ir.iva_percentage,
                   ir.iva_amount,
                   ir.irpf_percentage,
                   ir.irpf_amount,
                   ir.total_amount
            FROM invoices_received ir
            INNER JOIN suppliers s ON ir.supplier_id = s.id
            ${whereClause}
              AND ir.is_refund = FALSE
            ORDER BY ir.invoice_date ASC, ir.id ASC
        `, params);
        return rows;
    }
}