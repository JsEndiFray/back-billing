import db from '../db/dbConnect.js';

/**
 * Repositorio para manejar facturas emitidas a clientes
 * Gestiona la tabla invoices_issued con relaciones a estates, owners y clients
 */
export default class InvoicesIssuedRepository {

    /**
     * Obtiene todas las facturas emitidas con información de cobros incluida
     */
    static async getAll() {
        const [rows] = await db.query(`
            SELECT ii.id,
                   ii.invoice_number,
                   ii.estates_id,
                   ii.clients_id,
                   ii.owners_id,
                   ii.ownership_percent,
                   ii.invoice_date,
                   ii.due_date,
                   ii.tax_base,
                   ii.iva,
                   ii.irpf,
                   ii.total,
                   ii.is_refund,
                   ii.original_invoice_id,
                   ii.collection_status,
                   ii.collection_method,
                   ii.collection_date,
                   ii.collection_reference,
                   ii.collection_notes,
                   ii.start_date,
                   ii.end_date,
                   ii.corresponding_month,
                   ii.is_proportional,
                   ii.created_at,
                   ii.updated_at,
                   e.address         AS estate_name,
                   o.name            AS owner_name,
                   c.name            AS client_name,
                   oi.invoice_number AS original_invoice_number
            FROM invoices_issued ii
                     JOIN estates e ON ii.estates_id = e.id
                     JOIN owners o ON ii.owners_id = o.id
                     JOIN clients c ON ii.clients_id = c.id
                     LEFT JOIN invoices_issued oi ON ii.original_invoice_id = oi.id
            ORDER BY ii.id ASC
        `);
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca factura por ID único
     */
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   ii.collection_status,
                   ii.collection_method,
                   ii.collection_date,
                   ii.collection_reference,
                   ii.collection_notes,
                   ii.start_date,
                   ii.end_date,
                   ii.corresponding_month,
                   ii.is_proportional
            FROM invoices_issued ii
            WHERE ii.id = ?`, [id]);
        return rows;
    }

    /**
     * Busca factura por número de factura (único)
     */
    static async findByInvoiceNumber(invoice_number) {
        const [rows] = await db.query('SELECT * FROM invoices_issued WHERE invoice_number = ?', [invoice_number]);
        return rows;
    }

    /**
     * Busca todas las facturas de un propietario
     */
    static async findByOwnersId(ownersId) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   ii.collection_status,
                   ii.collection_method,
                   ii.collection_date,
                   ii.collection_reference,
                   ii.collection_notes,
                   ii.start_date,
                   ii.end_date,
                   ii.corresponding_month,
                   ii.is_proportional
            FROM invoices_issued ii
            WHERE ii.owners_id = ?`, [ownersId]);
        return rows;
    }

    /**
     * Busca todas las facturas de un cliente
     */
    static async findByClientId(clientId) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   ii.collection_status,
                   ii.collection_method,
                   ii.collection_date,
                   ii.collection_reference,
                   ii.collection_notes,
                   ii.start_date,
                   ii.end_date,
                   ii.corresponding_month,
                   ii.is_proportional
            FROM invoices_issued ii
            WHERE ii.clients_id = ?`, [clientId]);
        return rows;
    }

    /**
     * Busca facturas por NIF del cliente (historial por identificación)
     */
    static async findByClientNif(nif) {
        const [rows] = await db.query(`
            SELECT invoices_issued.*,
                   invoices_issued.collection_status,
                   invoices_issued.collection_method,
                   invoices_issued.collection_date,
                   invoices_issued.collection_reference,
                   invoices_issued.collection_notes,
                   invoices_issued.start_date,
                   invoices_issued.end_date,
                   invoices_issued.corresponding_month,
                   invoices_issued.is_proportional
            FROM invoices_issued
                     JOIN clients ON invoices_issued.clients_id = clients.id
            WHERE clients.identification = ?`, [nif]);
        return rows;
    }

    /**
     * Busca facturas que tienen el mismo propietario Y la misma propiedad
     */
    static async findByOwnersAndEstate(ownersId, estateId) {
        const [rows] = await db.query(`
                    SELECT *
                    FROM invoices_issued
                    WHERE owners_id = ?
                      AND estates_id = ?`,
            [ownersId, estateId]
        );
        return rows;
    }

    /**
     * Busca facturas por estado de cobro
     */
    static async findByCollectionStatus(status) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   e.address AS estate_name,
                   o.name    AS owner_name,
                   c.name    AS client_name
            FROM invoices_issued ii
                     JOIN estates e ON ii.estates_id = e.id
                     JOIN owners o ON ii.owners_id = o.id
                     JOIN clients c ON ii.clients_id = c.id
            WHERE ii.collection_status = ?
            ORDER BY ii.due_date ASC, ii.invoice_date DESC
        `, [status]);
        return rows;
    }

    /**
     * Busca facturas vencidas (overdue)
     */
    static async findOverdueInvoices() {
        const [rows] = await db.query(`
            SELECT ii.*,
                   e.address                           AS estate_name,
                   o.name                              AS owner_name,
                   c.name                              AS client_name,
                   DATEDIFF(CURRENT_DATE, ii.due_date) AS days_overdue
            FROM invoices_issued ii
                     JOIN estates e ON ii.estates_id = e.id
                     JOIN owners o ON ii.owners_id = o.id
                     JOIN clients c ON ii.clients_id = c.id
            WHERE ii.collection_status = 'pending'
              AND ii.due_date < CURRENT_DATE
            ORDER BY ii.due_date ASC
        `);
        return rows;
    }

    /**
     * Busca facturas próximas a vencer
     */
    static async findDueSoon(days = 7) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   e.address                           AS estate_name,
                   o.name                              AS owner_name,
                   c.name                              AS client_name,
                   DATEDIFF(ii.due_date, CURRENT_DATE) AS days_until_due
            FROM invoices_issued ii
                     JOIN estates e ON ii.estates_id = e.id
                     JOIN owners o ON ii.owners_id = o.id
                     JOIN clients c ON ii.clients_id = c.id
            WHERE ii.collection_status = 'pending'
              AND ii.due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
            ORDER BY ii.due_date ASC
        `, [days]);
        return rows;
    }

    /**
     * Busca facturas por rango de fechas
     */
    static async findByDateRange(startDate, endDate) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   e.address AS estate_name,
                   o.name    AS owner_name,
                   c.name    AS client_name
            FROM invoices_issued ii
                     JOIN estates e ON ii.estates_id = e.id
                     JOIN owners o ON ii.owners_id = o.id
                     JOIN clients c ON ii.clients_id = c.id
            WHERE ii.invoice_date BETWEEN ? AND ?
            ORDER BY ii.invoice_date DESC
        `, [startDate, endDate]);
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Obtiene el último número de factura para generar el siguiente
     */
    static async getLastInvoiceNumber() {
        const [rows] = await db.query(`
            SELECT invoice_number
            FROM invoices_issued
            WHERE is_refund = FALSE
              AND invoice_number LIKE 'FACT-%'
            ORDER BY id DESC LIMIT 1`
        );
        return rows;
    }

    /**
     * Crea una nueva factura emitida
     */
    static async create(invoice) {
        const {
            invoice_number,
            estates_id,
            owners_id,
            clients_id,
            invoice_date,
            due_date = null,
            tax_base,
            iva,
            irpf,
            total,
            ownership_percent,
            collection_status = 'pending',
            collection_method = 'transfer',
            collection_date = null,
            collection_reference = null,
            collection_notes = null,
            start_date = null,
            end_date = null,
            corresponding_month = null,
            is_proportional = 0,
            pdf_path = null,
            has_attachments = false,
            created_by = null
        } = invoice;

        const [result] = await db.query(`
            INSERT INTO invoices_issued (invoice_number, estates_id, owners_id, clients_id, invoice_date, due_date,
                                         tax_base, iva, irpf, total, ownership_percent, is_refund, original_invoice_id,
                                         collection_status, collection_method, collection_date, collection_reference,
                                         collection_notes,
                                         start_date, end_date, corresponding_month, is_proportional,
                                         pdf_path, has_attachments, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            invoice_number, estates_id, owners_id, clients_id, invoice_date, due_date,
            tax_base, iva, irpf, total, ownership_percent,
            collection_status, collection_method, collection_date, collection_reference, collection_notes,
            start_date, end_date, corresponding_month, is_proportional,
            pdf_path, has_attachments, created_by
        ]);
        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    // ========================================
    // MÉTODOS PARA GESTIÓN DE COBROS
    // ========================================

    /**
     * Actualiza el estado y método de cobro de una factura
     */
    static async updateCollectionStatus(id, collectionData) {
        const {
            collection_status,
            collection_method,
            collection_date,
            collection_reference,
            collection_notes
        } = collectionData;

        const [result] = await db.query(`
                    UPDATE invoices_issued
                    SET collection_status    = ?,
                        collection_method    = ?,
                        collection_date      = ?,
                        collection_reference = ?,
                        collection_notes     = ?,
                        updated_at           = NOW()
                    WHERE id = ?`,
            [collection_status, collection_method, collection_date, collection_reference, collection_notes, id]
        );
        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    // ========================================
    // MÉTODOS PARA ESTADÍSTICAS Y REPORTES
    // ========================================

    /**
     * Obtiene estadísticas de facturas emitidas
     */
    static async getStats() {
        const [rows] = await db.query(`
            SELECT COUNT(*)                                                                 as total_invoices,
                   SUM(CASE WHEN collection_status = 'pending' THEN 1 ELSE 0 END)           as pending_invoices,
                   SUM(CASE WHEN collection_status = 'collected' THEN 1 ELSE 0 END)         as collected_invoices,
                   SUM(CASE WHEN collection_status = 'overdue' THEN 1 ELSE 0 END)           as overdue_invoices,
                   SUM(CASE WHEN is_refund = FALSE THEN total ELSE 0 END)                   as total_amount,
                   SUM(CASE WHEN is_refund = FALSE THEN (tax_base * iva / 100) ELSE 0 END)  as total_iva_repercutido,
                   SUM(CASE WHEN is_refund = FALSE THEN (tax_base * irpf / 100) ELSE 0 END) as total_irpf_retenido,
                   SUM(CASE
                           WHEN collection_status = 'pending' AND is_refund = FALSE THEN total
                           ELSE 0 END)                                                      as pending_amount
            FROM invoices_issued
        `);
        return rows[0] || {};
    }

    /**
     * Obtiene estadísticas por cliente
     */
    static async getStatsByClient() {
        const [rows] = await db.query(`
            SELECT c.name                                                                            as client_name,
                   c.identification                                                                  as client_nif,
                   COUNT(*)                                                                          as invoice_count,
                   SUM(CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE 0 END)                      as total_amount,
                   SUM(CASE WHEN ii.is_refund = FALSE THEN (ii.tax_base * ii.iva / 100) ELSE 0 END)  as total_iva,
                   SUM(CASE WHEN ii.is_refund = FALSE THEN (ii.tax_base * ii.irpf / 100) ELSE 0 END) as total_irpf
            FROM invoices_issued ii
                     INNER JOIN clients c ON ii.clients_id = c.id
            WHERE ii.is_refund = FALSE
            GROUP BY ii.clients_id, c.name, c.identification
            ORDER BY total_amount DESC
        `);
        return rows;
    }

    /**
     * Obtiene estadísticas por propietario
     */
    static async getStatsByOwner() {
        const [rows] = await db.query(`
            SELECT o.name                                                          as owner_name,
                   o.identification                                                as owner_nif,
                   COUNT(*)                                                        as invoice_count,
                   SUM(CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE 0 END)    as total_amount,
                   AVG(CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE NULL END) as avg_amount
            FROM invoices_issued ii
                     INNER JOIN owners o ON ii.owners_id = o.id
            WHERE ii.is_refund = FALSE
            GROUP BY ii.owners_id, o.name, o.identification
            ORDER BY total_amount DESC
        `);
        return rows;
    }

    /**
     * Obtiene facturas para el libro de IVA repercutido
     */
    static async getForVATBook(year, month = null) {
        let whereClause = 'WHERE YEAR(ii.invoice_date) = ?';
        let params = [year];

        if (month) {
            whereClause += ' AND MONTH(ii.invoice_date) = ?';
            params.push(month);
        }

        const [rows] = await db.query(`
            SELECT ii.invoice_date,
                   ii.invoice_number,
                   c.name                        AS client_name,
                   c.identification              AS client_nif,
                   ii.tax_base,
                   ii.iva                        as iva_percentage,
                   (ii.tax_base * ii.iva / 100)  as iva_amount,
                   ii.irpf                       as irpf_percentage,
                   (ii.tax_base * ii.irpf / 100) as irpf_amount,
                   ii.total
            FROM invoices_issued ii
                     INNER JOIN clients c ON ii.clients_id = c.id ${whereClause}
              AND ii.is_refund = FALSE
            ORDER BY ii.invoice_date ASC, ii.id ASC
        `, params);
        return rows;
    }

    /**
     * Obtiene balance de ingresos vs gastos (requiere join con invoices_received)
     */
    static async getIncomeStatement(year, month = null) {
        let whereClause = 'WHERE YEAR(ii.invoice_date) = ?';
        let params = [year];

        if (month) {
            whereClause += ' AND MONTH(ii.invoice_date) = ?';
            params.push(month);
        }

        const [rows] = await db.query(`
            SELECT 'INGRESOS'                                                         as type,
                   SUM(CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE 0 END)       as total_amount,
                   SUM(CASE WHEN ii.is_refund = TRUE THEN ABS(ii.total) ELSE 0 END)   as refunds_amount,
                   (SUM(CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE 0 END) -
                    SUM(CASE WHEN ii.is_refund = TRUE THEN ABS(ii.total) ELSE 0 END)) as net_amount
            FROM invoices_issued ii
                ${whereClause}
        `, params);
        return rows;
    }

    /**
     * Obtiene facturas pendientes de cobro con aging (antigüedad)
     */
    static async getPendingInvoicesAging() {
        const [rows] = await db.query(`
            SELECT ii.*,
                   c.name                              as client_name,
                   e.address                           as estate_name,
                   DATEDIFF(CURRENT_DATE, ii.due_date) as days_overdue,
                   CASE
                       WHEN DATEDIFF(CURRENT_DATE, ii.due_date) <= 0 THEN 'CURRENT'
                       WHEN DATEDIFF(CURRENT_DATE, ii.due_date) <= 30 THEN '1-30_DAYS'
                       WHEN DATEDIFF(CURRENT_DATE, ii.due_date) <= 60 THEN '31-60_DAYS'
                       WHEN DATEDIFF(CURRENT_DATE, ii.due_date) <= 90 THEN '61-90_DAYS'
                       ELSE 'OVER_90_DAYS'
                       END                             as aging_bucket
            FROM invoices_issued ii
                     INNER JOIN clients c ON ii.clients_id = c.id
                     INNER JOIN estates e ON ii.estates_id = e.id
            WHERE ii.collection_status = 'pending'
              AND ii.is_refund = FALSE
            ORDER BY ii.due_date ASC
        `);
        return rows;
    }

    /**
     * Busca facturas por mes de correspondencia
     */
    static async findByCorrespondingMonth(correspondingMonth) {
        const [rows] = await db.query(`
            SELECT ii.*,
                   c.name    as client_name,
                   e.address as estate_name
            FROM invoices_issued ii
                     INNER JOIN clients c ON ii.clients_id = c.id
                     INNER JOIN estates e ON ii.estates_id = e.id
            WHERE ii.corresponding_month = ?
            ORDER BY ii.invoice_date ASC
        `, [correspondingMonth]);
        return rows;
    }

    /**
     * Obtiene resumen de facturación por mes
     */
    static async getMonthlySummary(year) {
        const [rows] = await db.query(`
            SELECT
                MONTH (ii.invoice_date) as month, MONTHNAME(ii.invoice_date) as month_name, COUNT (*) as invoice_count, SUM (CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE 0 END) as total_invoiced, SUM (CASE WHEN ii.is_refund = TRUE THEN ABS(ii.total) ELSE 0 END) as total_refunded, (SUM (CASE WHEN ii.is_refund = FALSE THEN ii.total ELSE 0 END) -
                SUM (CASE WHEN ii.is_refund = TRUE THEN ABS(ii.total) ELSE 0 END)) as net_amount
            FROM invoices_issued ii
            WHERE YEAR (ii.invoice_date) = ?
            GROUP BY MONTH (ii.invoice_date), MONTHNAME(ii.invoice_date)
            ORDER BY MONTH (ii.invoice_date)
        `, [year]);
        return rows;
    }


    /**
     * Actualiza una factura existente
     * Nota: No permite cambiar estate_id (la propiedad asociada)
     */
    static async update(invoice) {
        const {
            id,
            invoice_number,
            owners_id,
            clients_id,
            invoice_date,
            due_date,
            tax_base,
            iva,
            irpf,
            total,
            ownership_percent,
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
        } = invoice;

        const [result] = await db.query(`
                    UPDATE invoices_issued
                    SET invoice_number       = ?,
                        owners_id            = ?,
                        clients_id           = ?,
                        invoice_date         = ?,
                        due_date             = ?,
                        tax_base             = ?,
                        iva                  = ?,
                        irpf                 = ?,
                        total                = ?,
                        ownership_percent    = ?,
                        collection_status    = ?,
                        collection_method    = ?,
                        collection_date      = ?,
                        collection_reference = ?,
                        collection_notes     = ?,
                        start_date           = ?,
                        end_date             = ?,
                        corresponding_month  = ?,
                        is_proportional      = ?,
                        pdf_path             = ?,
                        has_attachments      = ?,
                        updated_at           = NOW()
                    WHERE id = ?`,
            [
                invoice_number, owners_id, clients_id, invoice_date, due_date,
                tax_base, iva, irpf, total, ownership_percent,
                collection_status, collection_method, collection_date, collection_reference, collection_notes,
                start_date, end_date, corresponding_month, is_proportional,
                pdf_path, has_attachments,
                id
            ]
        );
        return result.affectedRows > 0 ? [{id: Number(invoice.id), updated: true}] : [];
    }

    /**
     * Elimina una factura
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM invoices_issued WHERE id = ?', [id]);
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }

// ========================================
// MÉTODOS PARA DESCARGA/IMPRESIÓN
// ========================================

    /**
     * Obtiene factura con TODOS los detalles para impresión/PDF
     * Incluye información completa de cliente, propiedad y propietario
     */
    static async findByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
                SELECT ii.*,
                       ii.start_date,
                       ii.end_date,
                       ii.corresponding_month,
                       ii.is_proportional,
                       -- Datos del cliente
                       c.name                as client_name,
                       c.lastname            as client_lastname,
                       c.identification      as client_identification,
                       c.company_name        as client_company_name,
                       c.address             as client_address,
                       c.postal_code         as client_postal_code,
                       c.location            as client_location,
                       c.province            as client_province,
                       c.country             as client_country,
                       c.type_client         as client_type,
                       c.phone               as client_phone,

                       -- Datos de la propiedad
                       e.cadastral_reference as estate_reference_cadastral,
                       e.address             as estate_address,

                       -- Datos del propietario
                       o.name                as owner_name,
                       o.lastname            as owner_lastname,
                       o.identification      as owner_identification,
                       o.address             as owner_address,
                       o.postal_code         as owner_postal_code,
                       o.location            as owner_location,
                       o.province            as owner_province,
                       o.country             as owner_country,
                       o.phone               as owner_phone
                FROM invoices_issued ii
                         LEFT JOIN clients c ON ii.clients_id = c.id
                         LEFT JOIN estates e ON ii.estates_id = e.id
                         LEFT JOIN owners o ON ii.owners_id = o.id
                WHERE ii.id = ?
            `, [id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

// ========================================
// MÉTODOS PARA ABONOS/REEMBOLSOS
// ========================================

    /**
     * Obtiene el último número de abono para generar el siguiente
     */
    static async getLastRefundNumber() {
        const [rows] = await db.query(`
            SELECT invoice_number
            FROM invoices_issued
            WHERE is_refund = TRUE
            ORDER BY id DESC LIMIT 1`
        );
        return rows;
    }

    /**
     * Obtiene todos los abonos con información de relaciones
     * Incluye el número de la factura original
     */
    static async getAllRefunds() {
        const [rows] = await db.query(`
            SELECT ii.id,
                   ii.invoice_number,
                   ii.estates_id,
                   ii.clients_id,
                   ii.owners_id,
                   ii.ownership_percent,
                   ii.invoice_date,
                   ii.tax_base,
                   ii.iva,
                   ii.irpf,
                   ii.total,
                   ii.is_refund,
                   ii.created_at,
                   ii.updated_at,
                   ii.original_invoice_id,
                   ii.start_date,
                   ii.end_date,
                   ii.corresponding_month,
                   ii.is_proportional,
                   e.address         AS estate_name,
                   o.name            AS owner_name,
                   c.name            AS client_name,
                   oi.invoice_number AS original_invoice_number
            FROM invoices_issued ii
                     JOIN estates e ON ii.estates_id = e.id
                     JOIN owners o ON ii.owners_id = o.id
                     JOIN clients c ON ii.clients_id = c.id
                     LEFT JOIN invoices_issued oi ON ii.original_invoice_id = oi.id
            WHERE ii.is_refund = TRUE
            ORDER BY ii.id ASC
        `);
        return rows;
    }

    /**
     * Obtiene un abono con todos sus detalles para impresión
     * Incluye información de la factura original
     */
    static async findRefundByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
                SELECT ii.*,
                       ii.start_date,
                       ii.end_date,
                       ii.corresponding_month,
                       ii.is_proportional,
                       -- Datos del cliente
                       c.name                as client_name,
                       c.lastname            as client_lastname,
                       c.identification      as client_identification,
                       c.company_name        as client_company_name,
                       c.address             as client_address,
                       c.postal_code         as client_postal_code,
                       c.location            as client_location,
                       c.province            as client_province,
                       c.country             as client_country,
                       c.type_client         as client_type,
                       c.phone               as client_phone,

                       -- Datos de la propiedad
                       e.cadastral_reference as estate_reference_cadastral,
                       e.address             as estate_address,

                       -- Datos del propietario
                       o.name                as owner_name,
                       o.lastname            as owner_lastname,
                       o.identification      as owner_identification,
                       o.address             as owner_address,
                       o.postal_code         as owner_postal_code,
                       o.location            as owner_location,
                       o.province            as owner_province,
                       o.country             as owner_country,
                       o.phone               as owner_phone,

                       -- Datos de la factura original
                       oi.invoice_number     as original_invoice_number
                FROM invoices_issued ii
                         LEFT JOIN clients c ON ii.clients_id = c.id
                         LEFT JOIN estates e ON ii.estates_id = e.id
                         LEFT JOIN owners o ON ii.owners_id = o.id
                         LEFT JOIN invoices_issued oi ON ii.original_invoice_id = oi.id
                WHERE ii.id = ?
                  AND ii.is_refund = TRUE
            `, [id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Crea un abono (factura de reembolso)
     */
    static async createRefund(invoice) {
        const {
            invoice_number,
            estates_id,
            owners_id,
            clients_id,
            invoice_date,
            tax_base,
            iva,
            irpf,
            total,
            ownership_percent,
            original_invoice_id,
            collection_status = 'pending',
            collection_method = 'transfer',
            collection_date = null,
            collection_reference = null,
            collection_notes = null,
            start_date = null,
            end_date = null,
            corresponding_month = null,
            is_proportional = 0,
            created_by = null
        } = invoice;

        const [result] = await db.query(`
                    INSERT INTO invoices_issued (invoice_number, estates_id, owners_id, clients_id, invoice_date,
                                                 tax_base, iva, irpf, total, ownership_percent,
                                                 is_refund, original_invoice_id,
                                                 collection_status, collection_method, collection_date, collection_reference,
                                                 collection_notes,
                                                 start_date, end_date, corresponding_month, is_proportional,
                                                 created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                invoice_number, estates_id, owners_id, clients_id, invoice_date,
                tax_base, iva, irpf, total, ownership_percent, original_invoice_id,
                collection_status, collection_method, collection_date, collection_reference, collection_notes,
                start_date, end_date, corresponding_month, is_proportional,
                created_by
            ]
        );
        return result.insertId ? [{id: result.insertId, created: true}] : [];

    }
}


