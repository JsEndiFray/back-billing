import db from '../db/dbConnect.js'

export default class RentalExpensesRepository {

    /**
     * Obtener todos los registros de gastos
     * @returns {Array} Array con todos los gastos
     */
    static async getAll() {
        const [rows] = await db.query(`
            SELECT r.id,
                   r.expense_number,
                   r.property_type,
                   r.property_name,
                   r.date,
                   r.monthly_rent,
                   r.electricity,
                   r.gas,
                   r.water,
                   r.community_fees,
                   r.insurance,
                   r.waste_tax,
                   r.others,
                   r.total_expenses,
                   r.notes,
                   r.is_refund,
                   r.original_expense_id,
                   r.payment_status,
                   r.payment_method,
                   r.payment_date,
                   r.payment_notes,
                   r.start_date,
                   r.end_date,
                   r.corresponding_month,
                   r.is_proportional,
                   r.date_create,
                   r.date_update,
                   original.expense_number AS original_expense_number
            FROM rental_expenses r
                     LEFT JOIN rental_expenses original ON r.original_expense_id = original.id
            ORDER BY r.id ASC
        `);
        return rows;
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================
    /**
     * Buscar por tipo de propiedad
     * @param {string} propertyType - Tipo de propiedad (residential/commercial)
     * @returns {Array} Array con los gastos filtrados
     */
    static async findByPropertyType(propertyType) {
        const [rows] = await db.query(`
            SELECT r.*,
                   r.payment_status,
                   r.payment_method,
                   r.payment_date,
                   r.payment_notes,
                   r.start_date,
                   r.end_date,
                   r.corresponding_month,
                   r.is_proportional
            FROM rental_expenses r
            WHERE r.property_type = ?
            ORDER BY r.date ASC
        `, [propertyType]);
        return rows;
    }

    /**
     * Buscar por nombre de propiedad
     * @param {string} propertyName - Nombre de la propiedad
     * @returns {Array} Array con los gastos de esa propiedad
     */
    static async findByPropertyName(propertyName) {
        const [rows] = await db.query(`
            SELECT r.*,
                   r.payment_status,
                   r.payment_method,
                   r.payment_date,
                   r.payment_notes,
                   r.start_date,
                   r.end_date,
                   r.corresponding_month,
                   r.is_proportional
            FROM rental_expenses r
            WHERE r.property_name = ?
            ORDER BY r.date ASC
        `, [propertyName]);
        return rows;
    }

    /**
     * Buscar por nombre de propiedad año y mes
     * @param {string} propertyName - Nombre de la propiedad
     * @returns {Array} Array con los gastos de esa propiedad
     */
    static async findByPropertyAndMonth(propertyName, year, month) {
        const [rows] = await db.query(`
            SELECT r.*,
                   r.payment_status,
                   r.payment_method,
                   r.payment_date,
                   r.payment_notes,
                   r.start_date,
                   r.end_date,
                   r.corresponding_month,
                   r.is_proportional
            FROM rental_expenses r
            WHERE r.property_name = ? AND YEAR (r.date) = ? AND MONTH (r.date) = ?
        `, [propertyName, year, month]);
        return rows;
    }

    /**
     * Buscar un registro por ID
     * @param {number} id - ID del registro
     * @returns {Array} Array con el registro encontrado
     */
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT r.*,
                   r.payment_status,
                   r.payment_method,
                   r.payment_date,
                   r.payment_notes,
                   r.start_date,
                   r.end_date,
                   r.corresponding_month,
                   r.is_proportional
            FROM rental_expenses r
            WHERE r.id = ?`, [id]);
        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crear un nuevo registro de gastos
     * @param {Object} expenseData - Datos del gasto
     * @returns {Array} Array con el ID creado
     */
    static async create(data) {
        const {
            expense_number,
            property_type,
            property_name,
            date,
            monthly_rent = 0.00,
            electricity = 0.00,
            gas = 0.00,
            water = 0.00,
            community_fees = 0.00,
            insurance = 0.00,
            waste_tax = 0.00,
            others = 0.00,
            notes = '',
            payment_status = 'pending',
            payment_method = 'transfer',
            payment_date = null,
            payment_notes = '',
            start_date = null,
            end_date = null,
            corresponding_month = null,
            is_proportional = 0
        } = data;

        const [result] = await db.query(`
            INSERT INTO rental_expenses
            (expense_number, property_type, property_name, date, monthly_rent, electricity, gas, water,
             community_fees, insurance, waste_tax, others, notes, is_refund, original_expense_id,
             payment_status, payment_method, payment_date, payment_notes,
             start_date, end_date, corresponding_month, is_proportional, date_create, date_update)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            expense_number, property_type, property_name, date, monthly_rent, electricity,
            gas, water, community_fees, insurance, waste_tax, others, notes,
            false, // is_refund - PARÁMETRO EN LUGAR DE FALSE
            null,  // original_expense_id - PARÁMETRO EN LUGAR DE NULL
            payment_status, payment_method, payment_date, payment_notes,
            start_date, end_date, corresponding_month, is_proportional || 0
        ]);

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualizar un registro de gastos
     * @param {Object} expenseData - Datos del gasto (debe incluir id)
     * @returns {Array} Array indicando si fue actualizado
     */
    static async update(id, data) {
        const {
            expense_number,
            property_type,
            property_name,
            date,
            monthly_rent,
            electricity,
            gas,
            water,
            community_fees,
            insurance,
            waste_tax,
            others,
            notes,
            payment_status,
            payment_method,
            payment_date,
            payment_notes,
            start_date,
            end_date,
            corresponding_month,
            is_proportional
        } = data;

        const [result] = await db.query(`
            UPDATE rental_expenses
            SET expense_number      = ?,
                property_type       = ?,
                property_name       = ?,
                date                = ?,
                monthly_rent        = ?,
                electricity         = ?,
                gas                 = ?,
                water               = ?,
                community_fees      = ?,
                insurance           = ?,
                waste_tax           = ?,
                others              = ?,
                notes               = ?,
                payment_status      = ?,
                payment_method      = ?,
                payment_date        = ?,
                payment_notes       = ?,
                start_date          = ?,
                end_date            = ?,
                corresponding_month = ?,
                is_proportional     = ?,
                date_update         = NOW()
            WHERE id = ?
        `, [
            expense_number, property_type, property_name, date, monthly_rent, electricity,
            gas, water, community_fees, insurance, waste_tax, others, notes,
            payment_status, payment_method, payment_date, payment_notes,
            start_date, end_date, corresponding_month, is_proportional || 0,
            id
        ]);

        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Eliminar un registro de gastos
     * @param {number} id - ID del registro a eliminar
     * @returns {Array} Array indicando si fue eliminado
     */
    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM rental_expenses WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }

    // ========================================
    // MÉTODOS PARA ABONOS/REEMBOLSOS
    // ========================================

    /**
     * Obtener el último número de gasto para generar el siguiente
     */
    static async getLastExpenseNumber() {
        const [rows] = await db.query(
            `SELECT expense_number
             FROM rental_expenses
             WHERE is_refund = FALSE
               AND expense_number LIKE 'FACT-G-%'
             ORDER BY id DESC LIMIT 1`
        );
        return rows;
    }

    /**
     * Obtener el último número de abono
     */
    static async getLastRefundNumber() {
        const [rows] = await db.query(
            `SELECT expense_number
             FROM rental_expenses
             WHERE is_refund = TRUE
               AND expense_number LIKE 'ABONO-G-%'
             ORDER BY id DESC LIMIT 1`
        );
        return rows;
    }

    /**
     * Buscar por número de gasto/abono
     */
    static async findByExpenseNumber(expenseNumber) {
        const [rows] = await db.query(`
            SELECT *
            FROM rental_expenses
            WHERE expense_number = ?
            ORDER BY date DESC
        `, [expenseNumber]);
        return rows;
    }

    /**
     * Crear abono
     */
    static async createRefund(refundData) {
        const {
            expense_number, property_type, property_name, date,
            monthly_rent, electricity, gas, water, community_fees,
            insurance, waste_tax, others, notes, original_expense_id,
            payment_status = 'pending',
            payment_method = 'transfer',
            payment_date = null,
            payment_notes = '',
            start_date = null,
            end_date = null,
            corresponding_month = null,
            is_proportional = 0
        } = refundData;

        const [result] = await db.query(`
            INSERT INTO rental_expenses
            (expense_number, property_type, property_name, date, monthly_rent,
             electricity, gas, water, community_fees, insurance, waste_tax,
             others, notes, is_refund, original_expense_id,
             payment_status, payment_method, payment_date, payment_notes,
             start_date, end_date, corresponding_month, is_proportional,
             date_create, date_update)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            expense_number, property_type, property_name, date,
            monthly_rent, electricity, gas, water, community_fees,
            insurance, waste_tax, others, notes,
            true, // is_refund - PARÁMETRO EN LUGAR DE TRUE
            original_expense_id,
            payment_status, payment_method, payment_date, payment_notes,
            start_date, end_date, corresponding_month, is_proportional || 0
        ]);

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Obtener todos los abonos
     */
    static async getAllRefunds() {
        const [rows] = await db.query(`
            SELECT r.*,
                   original.expense_number as original_expense_number
            FROM rental_expenses r
                     LEFT JOIN rental_expenses original ON r.original_expense_id = original.id
            WHERE r.is_refund = TRUE
            ORDER BY r.id DESC
        `);
        return rows;
    }

    /**
     * Obtener gasto con TODOS los detalles para impresión/PDF
     * Incluye información completa para generar documentos
     */
    static async findByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
                SELECT r.*,
                       r.start_date,
                       r.end_date,
                       r.corresponding_month,
                       r.is_proportional,
                       r.payment_status,
                       r.payment_method,
                       r.payment_date,
                       r.payment_notes
                FROM rental_expenses r
                WHERE r.id = ?
            `, [id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener abono con todos sus detalles para impresión
     * Incluye información del gasto original
     */
    static async findRefundByIdWithDetails(id) {
        try {
            const [rows] = await db.query(`
                SELECT r.*,
                       r.start_date,
                       r.end_date,
                       r.corresponding_month,
                       r.is_proportional,
                       r.payment_status,
                       r.payment_method,
                       r.payment_date,
                       r.payment_notes,
                       original.expense_number as original_expense_number
                FROM rental_expenses r
                         LEFT JOIN rental_expenses original ON r.original_expense_id = original.id
                WHERE r.id = ?
                  AND r.is_refund = TRUE
            `, [id]);

            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar el estado y método de pago de un gasto
     */
    static async updatePaymentStatus(id, paymentData) {
        const {payment_status, payment_method, payment_date, payment_notes} = paymentData;

        const [result] = await db.query(
            `UPDATE rental_expenses
             SET payment_status = ?,
                 payment_method = ?,
                 payment_date   = ?,
                 payment_notes  = ?,
                 date_update    = NOW()
             WHERE id = ?`,
            [payment_status, payment_method, payment_date, payment_notes, id]
        );
        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

}