import db from '../db/dbConnect.js';

/**
 * Repositorio para manejar facturas y abonos
 * Gestiona la tabla bills con relaciones a estates, owners y clients
 */
export default class BillsRepository {

    /**
     * Obtiene todas las facturas con información de pagos incluida
     */
    static async getAll() {
        const [rows] = await db.query(`
            SELECT b.id,
                   b.bill_number,
                   b.estates_id,
                   b.clients_id,
                   b.owners_id,
                   b.ownership_percent,
                   b.date,
                   b.tax_base,
                   b.iva,
                   b.irpf,
                   b.total,
                   b.is_refund,
                   b.original_bill_id,
                   b.payment_status, -- NUEVO CAMPO
                   b.payment_method, -- NUEVO CAMPO  
                   b.payment_date,   -- NUEVO CAMPO
                   b.payment_notes,  -- NUEVO CAMPO
                   b.date_create,
                   b.date_update,
                   e.address      AS estate_name,
                   o.name         AS owner_name,
                   c.name         AS client_name,
                   ob.bill_number AS original_bill_number
            FROM bills b
                     JOIN estates e ON b.estates_id = e.id
                     JOIN owners o ON b.owners_id = o.id
                     JOIN clients c ON b.clients_id = c.id
                     LEFT JOIN bills ob ON b.original_bill_id = ob.id
            ORDER BY b.id ASC
        `);
        return rows;
    }


    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca factura por ID único y campos de pagos
     */
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT b.*,
                   b.payment_status,
                   b.payment_method,
                   b.payment_date,
                   b.payment_notes
            FROM bills b
            WHERE b.id = ?`, [id]);
        return rows[0] || null;
    }

    /**
     * Busca factura por número de factura (único)
     */
    static async findByBillNumber(bill_number) {
        const [rows] = await db.query('SELECT * FROM bills WHERE bill_number = ?', [bill_number]);
        return rows[0] || null;
    }

    /**
     * Busca todas las facturas de un propietario y actualizado con campos de pagos
     */
    static async findByOwnersId(ownersId) {
        const [rows] = await db.query(`
            SELECT b.*,
                   b.payment_status,
                   b.payment_method,
                   b.payment_date,
                   b.payment_notes
            FROM bills b
            WHERE b.owners_id = ?`, [ownersId]);
        return rows;
    }

    /**
     * Busca todas las facturas de un cliente
     */
    static async findByClientId(clientId) {
        const [rows] = await db.query(`
            SELECT b.*,
                   b.payment_status,
                   b.payment_method,
                   b.payment_date,
                   b.payment_notes
            FROM bills b
            WHERE b.clients_id = ?`, [clientId]);
        return rows;
    }

    /**
     * Busca facturas por NIF del cliente (historial por identificación)
     */
    static async findByClientNif(nif) {
        const [rows] = await db.query(`
            SELECT bills.*,
                   bills.payment_status,
                   bills.payment_method,
                   bills.payment_date,
                   bills.payment_notes
            FROM bills
                     JOIN clients ON bills.clients_id = clients.id
            WHERE clients.identification = ?`, [nif]);
        return rows;
    }

    /**
     * Busca facturas que tienen el mismo propietario Y la misma propiedad
     */
    static async findByOwnersAndEstate(ownersId, estateId) {
        const [rows] = await db.query(
            `SELECT *
             FROM bills
             WHERE owners_id = ?
               AND estates_id = ?`,
            [ownersId, estateId]
        );
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Obtiene el último número de factura para generar el siguiente
     */
    static async getLastBillNumber() {
        const [rows] = await db.query(
            `SELECT bill_number
             FROM bills
             ORDER BY id ASC LIMIT 1`
        );
        return rows[0]?.bill_number || null;
    }

    /**
     * Crea una nueva factura
     * @param {Object} bill - Datos de la factura
     * @returns {number} ID de la factura creada
     */
    static async create(bill) {
        const {
            bill_number,
            estates_id,
            owners_id,
            clients_id,
            date,
            tax_base,
            iva,
            irpf,
            total,
            ownership_percent,
            payment_status,
            payment_method,
            payment_date,
            payment_notes
        } = bill;
        // Campos por defecto: is_refund = FALSE, original_bill_id = NULL
        const [result] = await db.query(
            `INSERT INTO bills (bill_number, estates_id, owners_id, clients_id, date, tax_base, iva, irpf, total,
                                ownership_percent, is_refund, original_bill_id, payment_status, payment_method,
                                payment_date, payment_notes, date_create,
                                date_update) ` + `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, NULL, ?, ?, ?, ?, NOW(), NOW())`,
            [
                bill_number, estates_id, owners_id, clients_id, date,
                tax_base, iva, irpf, total, ownership_percent,
                payment_status, payment_method, payment_date, payment_notes
            ]
        );
        return result.insertId;
    }

    /**
     * Actualiza una factura existente
     * Nota: No permite cambiar estate_id (la propiedad asociada)
     */
    static async update(bill) {
        const {
            id,
            bill_number,
            owners_id,
            clients_id,
            date,
            tax_base,
            iva,
            irpf,
            total,
            ownership_percent,
            //AGREGAR CAMPOS DE PAGO
            payment_status,
            payment_method,
            payment_date,
            payment_notes
        } = bill;

        const [result] = await db.query(
            `UPDATE bills
             SET bill_number       = ?,
                 owners_id         = ?,
                 clients_id        = ?,
                 date              = ?,
                 tax_base          = ?,
                 iva               = ?,
                 irpf              = ?,
                 total             = ?,
                 ownership_percent = ?,
                 payment_status    = ?,
                 payment_method    = ?,
                 payment_date      = ?,
                 payment_notes     = ?,
                 date_update       = NOW()
             WHERE id = ?`,
            [
                bill_number, owners_id, clients_id, date,
                tax_base, iva, irpf, total, ownership_percent,
                payment_status, payment_method, payment_date, payment_notes,
                id
            ]
        );
        return result.affectedRows;
    }

    /**
     * Elimina una factura
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM bills WHERE id = ?', [id]);
        return result.affectedRows;
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
                SELECT b.*,
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
                FROM bills b
                         LEFT JOIN clients c ON b.clients_id = c.id
                         LEFT JOIN estates e ON b.estates_id = e.id
                         LEFT JOIN owners o ON b.owners_id = o.id
                WHERE b.id = ?
            `, [id]);

            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // ========================================
    // MÉTODOS PARA ABONOS/REEMBOLSOS
    // ========================================

    /**
     * Crea un abono con campos de pagos (factura de reembolso)
     * @param {Object} bill - Datos del abono, incluye original_bill_id
     */
    static async createRefund(bill) {
        const {
            bill_number,
            estates_id,
            owners_id,
            clients_id,
            date,
            tax_base,
            iva,
            irpf,
            total,
            ownership_percent,
            original_bill_id,
            //AGREGAR campos de pago con valores por defecto
            payment_status = 'pending',
            payment_method = 'transfer',
            payment_date = null,
            payment_notes = ''
        } = bill;

        const [result] = await db.query(`
            INSERT INTO bills (bill_number, estates_id, owners_id, clients_id, date,
                               tax_base, iva, irpf, total, ownership_percent,
                               is_refund, original_bill_id,
                               payment_status, payment_method, payment_date, payment_notes,
                               date_create,
                               date_update)` + ` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                bill_number, estates_id, owners_id, clients_id, date,
                tax_base, iva, irpf, total, ownership_percent, original_bill_id,
                payment_status, payment_method, payment_date, payment_notes
            ]
        );
        return result.insertId;
    }

    /**
     * Obtiene el último número de abono para generar el siguiente
     */
    static async getLastRefundNumber() {
        const [rows] = await db.query(
            `SELECT bill_number
             FROM bills
             WHERE is_refund = TRUE
             ORDER BY id DESC LIMIT 1`
        );
        return rows[0]?.bill_number || null;
    }

    /**
     * Obtiene todos los abonos con información de relaciones
     * Incluye el número de la factura original
     */
    static async getAllRefunds() {
        const [rows] = await db.query(`
            SELECT b.id,
                   b.bill_number,
                   b.estates_id,
                   b.clients_id,
                   b.owners_id,
                   b.ownership_percent,
                   b.date,
                   b.tax_base,
                   b.iva,
                   b.irpf,
                   b.total,
                   b.is_refund,
                   b.date_create,
                   b.date_update,
                   b.original_bill_id,
                   e.address      AS estate_name,
                   o.name         AS owner_name,
                   c.name         AS client_name,
                   ob.bill_number AS original_bill_number
            FROM bills b
                     JOIN estates e ON b.estates_id = e.id
                     JOIN owners o ON b.owners_id = o.id
                     JOIN clients c ON b.clients_id = c.id
                     LEFT JOIN bills ob ON b.original_bill_id = ob.id
            WHERE b.is_refund = TRUE
            ORDER BY b.id ASC
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
                SELECT b.*,
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
                       ob.bill_number        as original_bill_number
                FROM bills b
                         LEFT JOIN clients c ON b.clients_id = c.id
                         LEFT JOIN estates e ON b.estates_id = e.id
                         LEFT JOIN owners o ON b.owners_id = o.id
                         LEFT JOIN bills ob ON b.original_bill_id = ob.id
                WHERE b.id = ?
                  AND b.is_refund = TRUE
            `, [id]);

            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * ESTRUCTURA DE LA TABLA BILLS:
     * - id (PK)
     * - bill_number (número único de factura)
     * - estate_id (FK a estates)
     * - owners_id (FK a owners)
     * - clients_id (FK a clients)
     * - date (fecha de la factura)
     * - tax_base (base imponible)
     * - iva (impuesto sobre valor añadido)
     * - irpf (impuesto sobre renta de personas físicas)
     * - total (total a pagar)
     * - ownership_percent (porcentaje de propiedad)
     * - is_refund (boolean: true si es abono, false si es factura normal)
     * - original_bill_id (FK a bills, solo para abonos)
     * - date_create, date_update (timestamps)
     */


    // ========================================
    // MÉTODOS PARA GESTIÓN DE PAGOS
    // ========================================

    /**
     * Actualiza el estado y método de pago de una factura
     * @param {number} id - ID de la factura
     * @param {Object} paymentData - Datos del pago
     * @returns {number} Número de filas afectadas
     */
    static async updatePaymentStatus(id, paymentData) {
        const {payment_status, payment_method, payment_date, payment_notes} = paymentData;

        const [result] = await db.query(
            `UPDATE bills
             SET payment_status = ?,
                 payment_method = ?,
                 payment_date   = ?,
                 payment_notes  = ?,
                 date_update    = NOW()
             WHERE id = ?`,
            [payment_status, payment_method, payment_date, payment_notes, id]
        );
        return result.affectedRows;
    }


}

