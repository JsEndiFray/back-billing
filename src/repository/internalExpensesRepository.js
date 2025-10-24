import db from '../db/dbConnect.js';

/**
 * Repositorio para manejar gastos internos de la empresa
 * Gestiona la tabla internal_expenses con categorización, estados y reportes
 * DISEÑADO DESDE CERO para el sistema de gastos internos
 */
export default class InternalExpensesRepository {

    /**
     * Obtiene todos los gastos internos con información básica
     */
    static async getAll() {
        const [rows] = await db.query(`
            SELECT ie.id,
                   ie.expense_date,
                   ie.category,
                   ie.subcategory,
                   ie.description,
                   ie.amount,
                   ie.iva_percentage,
                   ie.iva_amount,
                   ie.total_amount,
                   ie.is_deductible,
                   ie.supplier_name,
                   ie.supplier_nif,
                   ie.payment_method,
                   ie.receipt_number,
                   ie.receipt_date,
                   ie.pdf_path,
                   ie.has_attachments,
                   ie.status,
                   ie.property_id,
                   ie.project_code,
                   ie.cost_center,
                   ie.notes,
                   ie.is_recurring,
                   ie.recurrence_period,
                   ie.next_occurrence_date,
                   ie.created_by,
                   ie.approved_by,
                   ie.approval_date,
                   ie.created_at,
                   ie.updated_at,
                   -- Datos de la propiedad
                   e.address AS estate_address,
                   -- Datos del propietario a través de estates_owners
                   eo.owners_id,
                   eo.ownership_percentage
            FROM internal_expenses ie
                     LEFT JOIN estates e ON ie.property_id = e.id -- Unir con la tabla estate
                     LEFT JOIN estate_owners eo ON e.id = eo.estate_id -- Unir con estates_owners
            ORDER BY ie.expense_date DESC, ie.id DESC
        `);
        return rows;
    }


    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Busca gasto por ID único
     */
    static async findById(id) {
        const [rows] = await db.query(`
            SELECT ie.*,
                   e.address AS estate_address,
                   eo.owners_id,
                   eo.ownership_percentage
            FROM internal_expenses ie
                     LEFT JOIN estates e ON ie.property_id = e.id
                     LEFT JOIN estate_owners eo ON e.id = eo.estate_id
            WHERE ie.id = ?`, [id]);
        return rows;
    }

    /**
     * Busca gastos por categoría
     */
    static async findByCategory(category) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.category = ?
            ORDER BY ie.expense_date DESC`, [category]);
        return rows;
    }

    /**
     * Busca gastos por subcategoría
     */
    static async findBySubcategory(subcategory) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.subcategory LIKE ?
            ORDER BY ie.expense_date DESC`, [`%${subcategory}%`]);
        return rows;
    }

    /**
     * Busca gastos por proveedor
     */
    static async findBySupplier(supplierName) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.supplier_name LIKE ?
            ORDER BY ie.expense_date DESC`, [`%${supplierName}%`]);
        return rows;
    }

    /**
     * Busca gastos por estado
     */
    static async findByStatus(status) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.status = ?
            ORDER BY ie.expense_date DESC`, [status]);
        return rows;
    }

    /**
     * Busca gastos por método de pago
     */
    static async findByPaymentMethod(paymentMethod) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.payment_method = ?
            ORDER BY ie.expense_date DESC`, [paymentMethod]);
        return rows;
    }

    /**
     * Busca gastos deducibles
     */
    static async findDeductible() {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.is_deductible = TRUE
            ORDER BY ie.expense_date DESC`);
        return rows;
    }

    /**
     * Busca gastos no deducibles
     */
    static async findNonDeductible() {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.is_deductible = FALSE
            ORDER BY ie.expense_date DESC`);
        return rows;
    }

    /**
     * Busca gastos por rango de fechas
     */
    static async findByDateRange(startDate, endDate) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.expense_date BETWEEN ? AND ?
            ORDER BY ie.expense_date DESC`, [startDate, endDate]);
        return rows;
    }

    /**
     * Busca gastos por rango de importes
     */
    static async findByAmountRange(minAmount, maxAmount) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.total_amount BETWEEN ? AND ?
            ORDER BY ie.total_amount DESC`, [minAmount, maxAmount]);
        return rows;
    }

    /**
     * Busca gastos relacionados con una propiedad
     */
    static async findByProperty(propertyId) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.property_id = ?
            ORDER BY ie.expense_date DESC`, [propertyId]);
        return rows;
    }

    /**
     * Busca gastos por proyecto
     */
    static async findByProject(projectCode) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.project_code = ?
            ORDER BY ie.expense_date DESC`, [projectCode]);
        return rows;
    }

    /**
     * Busca gastos por centro de coste
     */
    static async findByCostCenter(costCenter) {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.cost_center = ?
            ORDER BY ie.expense_date DESC`, [costCenter]);
        return rows;
    }

    /**
     * Busca gastos recurrentes
     */
    static async findRecurring() {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.is_recurring = TRUE
            ORDER BY ie.next_occurrence_date ASC`);
        return rows;
    }

    /**
     * Busca gastos pendientes de aprobación
     */
    static async findPendingApproval() {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.status = 'pending'
            ORDER BY ie.expense_date ASC`);
        return rows;
    }

    /**
     * Búsqueda avanzada con múltiples filtros
     */
    static async findAdvanced(filters) {
        let whereConditions = [];
        let params = [];

        if (filters.category) {
            whereConditions.push('ie.category = ?');
            params.push(filters.category);
        }

        if (filters.subcategory) {
            whereConditions.push('ie.subcategory LIKE ?');
            params.push(`%${filters.subcategory}%`);
        }

        if (filters.status) {
            whereConditions.push('ie.status = ?');
            params.push(filters.status);
        }

        if (filters.supplier_name) {
            whereConditions.push('ie.supplier_name LIKE ?');
            params.push(`%${filters.supplier_name}%`);
        }

        if (filters.payment_method) {
            whereConditions.push('ie.payment_method = ?');
            params.push(filters.payment_method);
        }

        if (filters.is_deductible !== undefined) {
            whereConditions.push('ie.is_deductible = ?');
            params.push(filters.is_deductible);
        }

        if (filters.start_date && filters.end_date) {
            whereConditions.push('ie.expense_date BETWEEN ? AND ?');
            params.push(filters.start_date, filters.end_date);
        }

        if (filters.min_amount && filters.max_amount) {
            whereConditions.push('ie.total_amount BETWEEN ? AND ?');
            params.push(filters.min_amount, filters.max_amount);
        }

        if (filters.property_id) {
            whereConditions.push('ie.property_id = ?');
            params.push(filters.property_id);
        }

        if (filters.project_code) {
            whereConditions.push('ie.project_code = ?');
            params.push(filters.project_code);
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            ${whereClause}
            ORDER BY ie.expense_date DESC
        `, params);

        return rows;
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crea un nuevo gasto interno
     */
    static async create(expense) {
        const {
            expense_date,
            category,
            subcategory = null,
            description,
            amount,
            iva_percentage = 21.00,
            iva_amount,
            total_amount,
            is_deductible = true,
            supplier_name,
            supplier_nif = null,
            supplier_address = null,
            payment_method = 'card',
            receipt_number = null,
            receipt_date = null,
            pdf_path = null,
            has_attachments = false,
            property_id = null,
            project_code = null,
            cost_center = null,
            notes = null,
            is_recurring = false,
            recurrence_period = null,
            next_occurrence_date = null,
            created_by = null,
            status = 'pending'
        } = expense;

        const [result] = await db.query(`
            INSERT INTO internal_expenses (
                expense_date, category, subcategory, description, amount, iva_percentage, iva_amount, total_amount,
                is_deductible, supplier_name, supplier_nif, supplier_address, payment_method, receipt_number,
                receipt_date, pdf_path, has_attachments, property_id, project_code, cost_center, notes,
                is_recurring, recurrence_period, next_occurrence_date, created_by, status,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
        `, [
            expense_date, category, subcategory, description, amount, iva_percentage, iva_amount, total_amount,
            is_deductible, supplier_name, supplier_nif, supplier_address, payment_method, receipt_number,
            receipt_date, pdf_path, has_attachments, property_id, project_code, cost_center, notes,
            is_recurring, recurrence_period, next_occurrence_date, created_by, status
        ]);

        return result.insertId ? [{id: result.insertId, created: true}] : [];
    }

    /**
     * Actualiza un gasto existente
     */
    static async update(expense) {
        const {
            id,
            expense_date,
            category,
            subcategory,
            description,
            amount,
            iva_percentage,
            iva_amount,
            total_amount,
            is_deductible,
            supplier_name,
            supplier_nif,
            supplier_address,
            payment_method,
            receipt_number,
            receipt_date,
            pdf_path,
            has_attachments,
            property_id,
            project_code,
            cost_center,
            notes,
            is_recurring,
            recurrence_period,
            next_occurrence_date,
            status
        } = expense;

        const [result] = await db.query(`
            UPDATE internal_expenses
            SET expense_date = ?, category = ?, subcategory = ?, description = ?, amount = ?,
                iva_percentage = ?, iva_amount = ?, total_amount = ?, is_deductible = ?,
                supplier_name = ?, supplier_nif = ?, supplier_address = ?, payment_method = ?,
                receipt_number = ?, receipt_date = ?, pdf_path = ?, has_attachments = ?,
                property_id = ?, project_code = ?, cost_center = ?, notes = ?,
                is_recurring = ?, recurrence_period = ?, next_occurrence_date = ?,
                status = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            expense_date, category, subcategory, description, amount, iva_percentage, iva_amount, total_amount,
            is_deductible, supplier_name, supplier_nif, supplier_address, payment_method, receipt_number,
            receipt_date, pdf_path, has_attachments, property_id, project_code, cost_center, notes,
            is_recurring, recurrence_period, next_occurrence_date, status, id
        ]);

        return result.affectedRows > 0 ? [{id: Number(id), updated: true}] : [];
    }

    /**
     * Elimina un gasto
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM internal_expenses WHERE id = ?', [id]);
        return result.affectedRows > 0 ? [{id: Number(id), deleted: true}] : [];
    }

    // ========================================
    // MÉTODOS PARA GESTIÓN DE ESTADOS
    // ========================================

    /**
     * Aprueba un gasto
     */
    static async approve(id, approvedBy) {
        const [result] = await db.query(`
            UPDATE internal_expenses
            SET status = 'approved', approved_by = ?, approval_date = CURDATE(), updated_at = NOW()
            WHERE id = ?
        `, [approvedBy, id]);

        return result.affectedRows > 0 ? [{id: Number(id), approved: true}] : [];
    }

    /**
     * Rechaza un gasto
     */
    static async reject(id, approvedBy) {
        const [result] = await db.query(`
            UPDATE internal_expenses
            SET status = 'rejected', approved_by = ?, approval_date = CURDATE(), updated_at = NOW()
            WHERE id = ?
        `, [approvedBy, id]);

        return result.affectedRows > 0 ? [{id: Number(id), rejected: true}] : [];
    }

    /**
     * Marca un gasto como pagado
     */
    static async markAsPaid(id) {
        const [result] = await db.query(`
            UPDATE internal_expenses
            SET status = 'paid', updated_at = NOW()
            WHERE id = ?
        `, [id]);

        return result.affectedRows > 0 ? [{id: Number(id), paid: true}] : [];
    }

    /**
     * Actualiza solo el estado de un gasto
     */
    static async updateStatus(id, status, approvedBy = null) {
        let query = `UPDATE internal_expenses SET status = ?, updated_at = NOW()`;
        let params = [status];

        if (status === 'approved' || status === 'rejected') {
            query += `, approved_by = ?, approval_date = CURDATE()`;
            params.push(approvedBy);
        }

        query += ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(query, params);
        return result.affectedRows > 0 ? [{id: Number(id), statusUpdated: true}] : [];
    }

    // ========================================
    // MÉTODOS PARA ESTADÍSTICAS Y REPORTES
    // ========================================

    /**
     * Obtiene estadísticas generales
     */
    static async getStats() {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_expenses,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_expenses,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_expenses,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_expenses,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_expenses,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN iva_amount ELSE 0 END) as total_iva_amount,
                SUM(CASE WHEN status IN ('approved', 'paid') AND is_deductible = TRUE THEN total_amount ELSE 0 END) as deductible_amount,
                SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
                AVG(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE NULL END) as average_expense
            FROM internal_expenses
        `);
        return rows[0] || {};
    }

    /**
     * Obtiene estadísticas por categoría
     */
    static async getStatsByCategory() {
        const [rows] = await db.query(`
            SELECT 
                category,
                COUNT(*) as expense_count,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN iva_amount ELSE 0 END) as total_iva,
                AVG(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE NULL END) as average_amount,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
            FROM internal_expenses
            GROUP BY category
            ORDER BY total_amount DESC
        `);
        return rows;
    }

    /**
     * Obtiene estadísticas por proveedor
     */
    static async getStatsBySupplier() {
        const [rows] = await db.query(`
            SELECT 
                supplier_name,
                supplier_nif,
                COUNT(*) as expense_count,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE 0 END) as total_spent,
                AVG(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE NULL END) as average_expense,
                MAX(expense_date) as last_expense_date,
                MIN(expense_date) as first_expense_date
            FROM internal_expenses
            WHERE status IN ('approved', 'paid')
            GROUP BY supplier_name, supplier_nif
            ORDER BY total_spent DESC
        `);
        return rows;
    }

    /**
     * Obtiene resumen mensual
     */
    static async getMonthlySummary(year) {
        const [rows] = await db.query(`
            SELECT 
                MONTH(expense_date) as month,
                MONTHNAME(expense_date) as month_name,
                COUNT(*) as expense_count,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN iva_amount ELSE 0 END) as total_iva,
                SUM(CASE WHEN status IN ('approved', 'paid') AND is_deductible = TRUE THEN total_amount ELSE 0 END) as deductible_amount
            FROM internal_expenses
            WHERE YEAR(expense_date) = ?
            GROUP BY MONTH(expense_date), MONTHNAME(expense_date)
            ORDER BY MONTH(expense_date)
        `, [year]);
        return rows;
    }

    /**
     * Obtiene resumen anual
     */
    static async getYearlySummary() {
        const [rows] = await db.query(`
            SELECT 
                YEAR(expense_date) as year,
                COUNT(*) as expense_count,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN total_amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN status IN ('approved', 'paid') THEN iva_amount ELSE 0 END) as total_iva,
                SUM(CASE WHEN status IN ('approved', 'paid') AND is_deductible = TRUE THEN total_amount ELSE 0 END) as deductible_amount
            FROM internal_expenses
            GROUP BY YEAR(expense_date)
            ORDER BY YEAR(expense_date) DESC
        `);
        return rows;
    }

    /**
     * Obtiene top gastos por importe
     */
    static async getTopExpensesByAmount(limit = 10) {
        const [rows] = await db.query(`
            SELECT 
                id, expense_date, category, description, supplier_name, total_amount, status
            FROM internal_expenses
            WHERE status IN ('approved', 'paid')
            ORDER BY total_amount DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }

    /**
     * Obtiene gastos para libro de IVA soportado
     */
    static async getForVATBook(year, month = null) {
        let whereClause = 'WHERE YEAR(ie.expense_date) = ? AND ie.status IN ("approved", "paid")';
        let params = [year];

        if (month) {
            whereClause += ' AND MONTH(ie.expense_date) = ?';
            params.push(month);
        }

        const [rows] = await db.query(`
            SELECT 
                ie.expense_date,
                ie.category,
                ie.subcategory,
                ie.description,
                ie.supplier_name,
                ie.supplier_nif,
                ie.amount as tax_base,
                ie.iva_percentage,
                ie.iva_amount,
                ie.total_amount,
                ie.is_deductible,
                ie.receipt_number
            FROM internal_expenses ie
            ${whereClause}
            ORDER BY ie.expense_date ASC, ie.id ASC
        `, params);
        return rows;
    }

    /**
     * Obtiene balance de gastos (para comparar con ingresos)
     */
    static async getExpenseStatement(year, month = null) {
        let whereClause = 'WHERE YEAR(ie.expense_date) = ? AND ie.status IN ("approved", "paid")';
        let params = [year];

        if (month) {
            whereClause += ' AND MONTH(ie.expense_date) = ?';
            params.push(month);
        }

        const [rows] = await db.query(`
            SELECT 
                'GASTOS_INTERNOS' as type,
                SUM(ie.total_amount) as total_amount,
                SUM(ie.iva_amount) as total_iva_soportado,
                SUM(CASE WHEN ie.is_deductible = TRUE THEN ie.total_amount ELSE 0 END) as deductible_amount,
                COUNT(*) as total_transactions
            FROM internal_expenses ie
            ${whereClause}
        `, params);
        return rows;
    }

    /**
     * Obtiene gastos por período de recurrencia
     */
    static async getRecurringExpensesDue() {
        const [rows] = await db.query(`
            SELECT ie.*
            FROM internal_expenses ie
            WHERE ie.is_recurring = TRUE 
            AND ie.next_occurrence_date <= CURDATE()
            AND ie.status IN ('approved', 'paid')
            ORDER BY ie.next_occurrence_date ASC
        `);
        return rows;
    }

    /**
     * Actualiza fechas de gastos recurrentes
     */
    static async updateRecurringDates(id, nextOccurrenceDate) {
        const [result] = await db.query(`
            UPDATE internal_expenses
            SET next_occurrence_date = ?, updated_at = NOW()
            WHERE id = ?
        `, [nextOccurrenceDate, id]);

        return result.affectedRows > 0 ? [{id: Number(id), dateUpdated: true}] : [];
    }
}