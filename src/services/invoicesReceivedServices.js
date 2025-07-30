import InvoicesReceivedRepository from "../repository/invoicesReceivedRepository.js";
import SuppliersRepository from "../repository/suppliersRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";
import CalculateHelper from "../shared/helpers/calculateTotal.js";

/**
 * Servicio de facturas recibidas de proveedores
 * Maneja toda la lógica de negocio relacionada con facturas de proveedores
 * Incluye gestión fiscal de IVA soportado para el libro de IVA
 */
export default class InvoicesReceivedService {

    // ==========================================
    // OBTENER FACTURAS RECIBIDAS (CONSULTAS)
    // ==========================================

    /**
     * Obtiene todas las facturas recibidas con formato estandarizado
     */
    static async getAllInvoicesReceived() {
        const invoices = await InvoicesReceivedRepository.getAll();

        return invoices.map(invoice => ({
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            our_reference: invoice.our_reference,
            supplier_id: invoice.supplier_id,
            supplier_name: invoice.supplier_company || invoice.supplier_name,
            supplier_tax_id: invoice.supplier_tax_id,
            property_id: invoice.property_id,
            invoice_date: invoice.invoice_date,
            due_date: invoice.due_date,
            received_date: invoice.received_date,
            tax_base: invoice.tax_base,
            iva_percentage: invoice.iva_percentage,
            iva_amount: invoice.iva_amount,
            irpf_percentage: invoice.irpf_percentage,
            irpf_amount: invoice.irpf_amount,
            total_amount: invoice.total_amount,
            category: invoice.category,
            subcategory: invoice.subcategory,
            description: invoice.description,
            notes: invoice.notes,
            payment_status: invoice.payment_status,
            payment_method: invoice.payment_method,
            payment_date: invoice.payment_date,
            payment_reference: invoice.payment_reference,
            payment_notes: invoice.payment_notes,
            start_date: invoice.start_date,
            end_date: invoice.end_date,
            corresponding_month: invoice.corresponding_month,
            is_proportional: invoice.is_proportional,
            is_refund: invoice.is_refund,
            original_invoice_id: invoice.original_invoice_id,
            original_invoice_number: invoice.original_invoice_number,
            pdf_path: invoice.pdf_path,
            has_attachments: invoice.has_attachments,
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            // Nuevas propiedades añadidas para el reparto por propietario
            owners_id: invoice.ownership_percentage || null, // Puede ser null si no hay propiedad asociada o propietarios en estates_owners
            ownership_percentage: invoice.ownership_percentage || 0 // Porcentaje de propiedad
        }));
    }

    // ==========================================
    // BÚSQUEDAS ESPECÍFICAS CON VALIDACIÓN
    // ==========================================

    /**
     * Busca una factura por ID
     */
    static async getInvoiceById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await InvoicesReceivedRepository.findById(id);
    }

    /**
     * Busca facturas por número de factura del proveedor
     */
    static async getInvoiceByNumber(invoiceNumber) {
        if (!invoiceNumber || invoiceNumber.length === 0) return [];
        return await InvoicesReceivedRepository.findByInvoiceNumber(sanitizeString(invoiceNumber));
    }

    /**
     * Busca facturas por proveedor
     */
    static async getInvoicesBySupplierId(supplierId) {
        if (!supplierId || isNaN(Number(supplierId))) return [];
        return await InvoicesReceivedRepository.findBySupplierId(supplierId);
    }

    /**
     * Busca facturas por categoría
     */
    static async getInvoicesByCategory(category) {
        const validCategories = CalculateHelper.getValidInvoiceReceivedCategories();

        if (!validCategories.includes(category)) return [];
        return await InvoicesReceivedRepository.findByCategory(category);
    }

    /**
     * Busca facturas por rango de fechas
     */
    static async getInvoicesByDateRange(startDate, endDate) {
        // Usar validación centralizada del helper
        const validation = CalculateHelper.validateDateRange(startDate, endDate);

        if (!validation.isValid) {
            return [];
        }

        return await InvoicesReceivedRepository.findByDateRange(startDate, endDate);
    }

    /**
     * Busca facturas por estado de pago
     */
    static async getInvoicesByPaymentStatus(status) {
        const validStatuses = CalculateHelper.getValidInvoicesReceivedStatuses();
        if (!validStatuses.includes(status)) return [];
        return await InvoicesReceivedRepository.findByPaymentStatus(status);
    }

    /**
     * Obtiene facturas vencidas
     */
    static async getOverdueInvoices() {
        return await InvoicesReceivedRepository.findOverdueInvoices();
    }

    /**
     * Obtiene facturas próximas a vencer
     */
    static async getInvoicesDueSoon(days = 7) {
        if (isNaN(Number(days)) || Number(days) < 1) days = 7;
        return await InvoicesReceivedRepository.findDueSoon(Number(days));
    }

    // ==========================================
    // CREAR NUEVA FACTURA RECIBIDA
    // ==========================================

    /**
     * Crea una nueva factura recibida con validaciones completas
     */
    static async createInvoiceReceived(data) {
        // Validación de datos obligatorios
        if (!data.invoice_number || !data.supplier_id || !data.invoice_date ||
            !data.tax_base || !data.description) {
            return null; // Faltan datos obligatorios
        }

        // Verificar que el proveedor existe
        const supplier = await SuppliersRepository.findById(data.supplier_id);
        if (!supplier.length) {
            return null; // Proveedor no existe
        }

        // Validar que no exista factura duplicada del mismo proveedor
        const existingInvoice = await InvoicesReceivedRepository.findByInvoiceNumber(data.invoice_number);
        const duplicateFromSameSupplier = existingInvoice.find(inv =>
            inv.supplier_id === Number(data.supplier_id) && !inv.is_refund
        );
        if (duplicateFromSameSupplier) {
            return null; // Factura duplicada del mismo proveedor
        }

        // Validar campos proporcionales si es necesario
        if (data.is_proportional) {
            const proportionalValidation = CalculateHelper.validateProportionalFields(data);
            if (!proportionalValidation.isValid) {
                throw new Error(proportionalValidation.message);
            }
        }

        // Calcular fecha de vencimiento si no se proporciona
        let dueDate = data.due_date;
        if (!dueDate && supplier[0].payment_terms) {
            const invoiceDate = new Date(data.invoice_date);
            invoiceDate.setDate(invoiceDate.getDate() + supplier[0].payment_terms);
            dueDate = invoiceDate.toISOString().split('T')[0];
        }

        // Calcular importes fiscales
        const fiscalCalculation = CalculateHelper.calculateFiscalAmounts({
            tax_base: parseFloat(data.tax_base),
            iva_percentage: parseFloat(data.iva_percentage) || 21.00,
            irpf_percentage: parseFloat(data.irpf_percentage) || 0.00,
            is_proportional: data.is_proportional || false,
            start_date: data.start_date,
            end_date: data.end_date
        });

        // Generar referencia interna automática
        const ourReference = await this.generateOurReference();

        // Generar mes de correspondencia
        const correspondingMonth = CalculateHelper.generateCorrespondingMonth(
            data.invoice_date,
            data.corresponding_month
        );

        // Preparar datos completos
        const invoiceData = {
            invoice_number: sanitizeString(data.invoice_number),
            our_reference: ourReference,
            supplier_id: Number(data.supplier_id),
            property_id: data.property_id ? Number(data.property_id) : null,
            invoice_date: data.invoice_date,
            due_date: dueDate,
            received_date: data.received_date || new Date().toISOString().split('T')[0],
            tax_base: fiscalCalculation.tax_base,
            iva_percentage: fiscalCalculation.iva_percentage,
            iva_amount: fiscalCalculation.iva_amount,
            irpf_percentage: fiscalCalculation.irpf_percentage,
            irpf_amount: fiscalCalculation.irpf_amount,
            total_amount: fiscalCalculation.total_amount,
            category: data.category || 'otros',
            subcategory: data.subcategory ? sanitizeString(data.subcategory) : null,
            description: sanitizeString(data.description),
            notes: data.notes ? sanitizeString(data.notes) : null,
            payment_status: data.payment_status || 'pending',
            payment_method: data.payment_method || 'transfer',
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            corresponding_month: correspondingMonth,
            is_proportional: Boolean(data.is_proportional),
            pdf_path: data.pdf_path || null,
            has_attachments: Boolean(data.has_attachments),
            created_by: data.created_by || null
        };

        const created = await InvoicesReceivedRepository.create(invoiceData);
        if (!created.length > 0) return [];

        return [{...invoiceData, id: created[0].id}];
    }

    // ==========================================
    // ACTUALIZAR FACTURA EXISTENTE
    // ==========================================

    /**
     * Actualiza una factura recibida existente
     */
    static async updateInvoiceReceived(id, updateData) {
        if (!id || isNaN(Number(id))) return [];

        // Verificar que la factura existe
        const existing = await InvoicesReceivedRepository.findById(id);
        if (!existing || existing.length === 0) return [];

        // Si se actualiza el proveedor, verificar que existe
        if (updateData.supplier_id) {
            const supplier = await SuppliersRepository.findById(updateData.supplier_id);
            if (!supplier.length) {
                return null; // Proveedor no existe
            }
        }

        // Validar campos proporcionales si se actualizan
        if (updateData.is_proportional || existing[0].is_proportional) {
            const proportionalValidation = CalculateHelper.validateProportionalFields({
                ...existing[0],
                ...updateData
            });
            if (!proportionalValidation.isValid) {
                throw new Error(proportionalValidation.message);
            }
        }

        // Recalcular importes fiscales si es necesario
        let fiscalCalculation = null;
        if (updateData.tax_base !== undefined || updateData.iva_percentage !== undefined ||
            updateData.irpf_percentage !== undefined || updateData.is_proportional !== undefined) {

            fiscalCalculation = CalculateHelper.calculateFiscalAmounts({
                tax_base: parseFloat(updateData.tax_base) || existing[0].tax_base,
                iva_percentage: parseFloat(updateData.iva_percentage) !== undefined ?
                    parseFloat(updateData.iva_percentage) : existing[0].iva_percentage,
                irpf_percentage: parseFloat(updateData.irpf_percentage) !== undefined ?
                    parseFloat(updateData.irpf_percentage) : existing[0].irpf_percentage,
                is_proportional: updateData.is_proportional !== undefined ?
                    updateData.is_proportional : existing[0].is_proportional,
                start_date: updateData.start_date || existing[0].start_date,
                end_date: updateData.end_date || existing[0].end_date
            });
        }

        // Generar mes de correspondencia actualizado
        const correspondingMonth = CalculateHelper.generateCorrespondingMonth(
            updateData.invoice_date || existing[0].invoice_date,
            updateData.corresponding_month
        );

        // Preparar datos para actualización
        const invoiceData = {
            invoice_number: updateData.invoice_number ?
                sanitizeString(updateData.invoice_number) : existing[0].invoice_number,
            our_reference: updateData.our_reference || existing[0].our_reference,
            supplier_id: Number(updateData.supplier_id) || existing[0].supplier_id,
            property_id: updateData.property_id !== undefined ?
                (updateData.property_id ? Number(updateData.property_id) : null) : existing[0].property_id,
            invoice_date: updateData.invoice_date || existing[0].invoice_date,
            due_date: updateData.due_date !== undefined ? updateData.due_date : existing[0].due_date,
            received_date: updateData.received_date || existing[0].received_date,
            tax_base: fiscalCalculation ? fiscalCalculation.tax_base : existing[0].tax_base,
            iva_percentage: fiscalCalculation ? fiscalCalculation.iva_percentage : existing[0].iva_percentage,
            iva_amount: fiscalCalculation ? fiscalCalculation.iva_amount : existing[0].iva_amount,
            irpf_percentage: fiscalCalculation ? fiscalCalculation.irpf_percentage : existing[0].irpf_percentage,
            irpf_amount: fiscalCalculation ? fiscalCalculation.irpf_amount : existing[0].irpf_amount,
            total_amount: fiscalCalculation ? fiscalCalculation.total_amount : existing[0].total_amount,
            category: updateData.category || existing[0].category,
            subcategory: updateData.subcategory !== undefined ?
                (updateData.subcategory ? sanitizeString(updateData.subcategory) : null) : existing[0].subcategory,
            description: updateData.description ?
                sanitizeString(updateData.description) : existing[0].description,
            notes: updateData.notes !== undefined ?
                (updateData.notes ? sanitizeString(updateData.notes) : null) : existing[0].notes,
            payment_status: updateData.payment_status || existing[0].payment_status,
            payment_method: updateData.payment_method || existing[0].payment_method,
            payment_date: updateData.payment_date !== undefined ?
                updateData.payment_date : existing[0].payment_date,
            payment_reference: updateData.payment_reference !== undefined ?
                updateData.payment_reference : existing[0].payment_reference,
            payment_notes: updateData.payment_notes !== undefined ?
                updateData.payment_notes : existing[0].payment_notes,
            start_date: updateData.start_date !== undefined ?
                updateData.start_date : existing[0].start_date,
            end_date: updateData.end_date !== undefined ?
                updateData.end_date : existing[0].end_date,
            corresponding_month: correspondingMonth,
            is_proportional: updateData.is_proportional !== undefined ?
                Boolean(updateData.is_proportional) : existing[0].is_proportional,
            pdf_path: updateData.pdf_path !== undefined ?
                updateData.pdf_path : existing[0].pdf_path,
            has_attachments: updateData.has_attachments !== undefined ?
                Boolean(updateData.has_attachments) : existing[0].has_attachments
        };

        const updated = await InvoicesReceivedRepository.update(Number(id), invoiceData);
        return updated;
    }

    // ==========================================
    // ELIMINAR FACTURA
    // ==========================================

    /**
     * Elimina una factura recibida
     */
    static async deleteInvoiceReceived(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InvoicesReceivedRepository.findById(id);
        if (!existing.length > 0) return [];

        // TODO: Verificar que no tenga abonos asociados

        const result = await InvoicesReceivedRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }

    // ==========================================
    // GESTIÓN DE PAGOS
    // ==========================================

    /**
     * Actualiza el estado de pago de una factura
     */
    static async updatePaymentStatus(id, paymentData) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InvoicesReceivedRepository.findById(id);
        if (!existing.length > 0) return [];

        // Validar estados permitidos
        const validStatuses = CalculateHelper.getValidInvoicesReceivedStatuses();
        if (!validStatuses.includes(paymentData.payment_status)) {
            return null;
        }

        // Validar métodos permitidos
        const validMethods = CalculateHelper.getValidPaymentMethods();
        if (paymentData.payment_method && !validMethods.includes(paymentData.payment_method)) {
            return null;
        }

        // REGLA DE NEGOCIO: Si se marca como pagado, debe tener fecha
        if (paymentData.payment_status === 'paid' && !paymentData.payment_date) {
            paymentData.payment_date = new Date().toISOString().split('T')[0];
        }

        // REGLA DE NEGOCIO: Si se marca como pendiente, limpiar fecha de pago
        if (paymentData.payment_status === 'pending') {
            paymentData.payment_date = null;
            paymentData.payment_reference = null;
        }

        const updated = await InvoicesReceivedRepository.updatePaymentStatus(Number(id), paymentData);
        if (!updated.length) return [];

        return await InvoicesReceivedRepository.findById(id);
    }

    // ==========================================
    // GESTIÓN DE ABONOS
    // ==========================================

    /**
     * Obtiene todos los abonos
     */
    static async getAllRefunds() {
        const refunds = await InvoicesReceivedRepository.getAllRefunds();

        return refunds.map(refund => ({
            id: refund.id,
            invoice_number: refund.invoice_number,
            supplier_name: refund.supplier_company || refund.supplier_name,
            invoice_date: refund.invoice_date,
            total_amount: refund.total_amount,
            category: refund.category,
            description: refund.description,
            original_invoice_id: refund.original_invoice_id,
            original_invoice_number: refund.original_invoice_number,
            created_at: refund.created_at
        }));
    }

    /**
     * Crea un abono basado en una factura original
     */
    static async createRefund(originalInvoiceId, refundReason = '') {
        if (!originalInvoiceId || isNaN(Number(originalInvoiceId))) return [];

        // Obtener factura original
        const original = await InvoicesReceivedRepository.findById(originalInvoiceId);
        if (!original.length) return [];

        // No se puede hacer abono de un abono
        if (original[0].is_refund) return [];

        // Generar número de abono
        const refundNumber = `ABONO-${original[0].invoice_number}`;

        // Crear abono con valores negativos
        const refundData = {
            invoice_number: refundNumber,
            supplier_id: original[0].supplier_id,
            property_id: original[0].property_id,
            invoice_date: new Date().toISOString().split('T')[0],
            tax_base: -Math.abs(original[0].tax_base),
            iva_percentage: original[0].iva_percentage,
            iva_amount: -Math.abs(original[0].iva_amount),
            irpf_percentage: original[0].irpf_percentage,
            irpf_amount: -Math.abs(original[0].irpf_amount),
            total_amount: -Math.abs(original[0].total_amount),
            category: original[0].category,
            subcategory: original[0].subcategory,
            description: `ABONO - ${refundReason || 'Rectificación'} - Original: ${original[0].invoice_number}`,
            notes: `Abono de factura ${original[0].invoice_number}`,
            original_invoice_id: original[0].id,
            start_date: original[0].start_date,
            end_date: original[0].end_date,
            corresponding_month: original[0].corresponding_month,
            is_proportional: original[0].is_proportional
        };

        const created = await InvoicesReceivedRepository.createRefund(refundData);
        if (!created.length > 0) return [];

        return [{...refundData, id: created[0].id}];
    }

    // ==========================================
    // ESTADÍSTICAS Y REPORTES
    // ==========================================

    /**
     * Obtiene estadísticas generales
     */
    static async getInvoiceStats() {
        const stats = await InvoicesReceivedRepository.getStats();
        return {
            total_invoices: stats.total_invoices || 0,
            pending_invoices: stats.pending_invoices || 0,
            paid_invoices: stats.paid_invoices || 0,
            overdue_invoices: stats.overdue_invoices || 0,
            total_amount: parseFloat(stats.total_amount) || 0,
            total_iva: parseFloat(stats.total_iva) || 0,
            pending_amount: parseFloat(stats.pending_amount) || 0,
            percentage_paid: stats.total_invoices > 0 ?
                Math.round((stats.paid_invoices / stats.total_invoices) * 100) : 0
        };
    }

    /**
     * Obtiene estadísticas por categoría
     */
    static async getStatsByCategory() {
        return await InvoicesReceivedRepository.getStatsByCategory();
    }

    /**
     * Obtiene datos para el libro de IVA soportado
     */
    static async getVATBookData(year, month = null) {
        if (!year || isNaN(Number(year))) return [];

        const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
            ? Number(month) : null;

        return await InvoicesReceivedRepository.getForVATBook(Number(year), validMonth);
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================
    /**
     * Genera referencia interna automática
     */
    static async generateOurReference() {
        const lastRef = await InvoicesReceivedRepository.getLastOurReference();
        let newRefNumber = 'FR-0001';

        if (lastRef.length > 0) {
            const lastNumber = parseInt(lastRef[0].our_reference.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newRefNumber = `FR-${String(nextNumber).padStart(4, '0')}`;
        }

        return newRefNumber;
    }


}