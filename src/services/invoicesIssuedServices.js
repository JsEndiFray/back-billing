 import InvoicesIssuedRepository from "../repository/invoicesIssuedRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";
import EstateOwnersRepository from "../repository/estatesOwnersRepository.js";
import CalculateHelper from "../shared/helpers/calculateTotal.js";

/**
 * Servicio de facturas emitidas a clientes
 * Maneja toda la lógica de negocio relacionada con facturas emitidas
 * Incluye gestión fiscal de IVA repercutido para el libro de IVA
 * MIGRADO DESDE: billsServices.js con adaptaciones
 */
export default class InvoicesIssuedService {

    // ==========================================
    // OBTENER FACTURAS EMITIDAS (CONSULTAS)
    // ==========================================

    /**
     * Obtiene todas las facturas emitidas con formato estandarizado
     */
    static async getAllInvoicesIssued() {
        const invoices = await InvoicesIssuedRepository.getAll();

        return invoices.map(invoice => ({
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            estates_id: invoice.estates_id,
            estate_name: invoice.estate_name,
            owners_id: invoice.owners_id,
            owner_name: invoice.owner_name,
            clients_id: invoice.clients_id,
            client_name: invoice.client_name,
            invoice_date: invoice.invoice_date,
            due_date: invoice.due_date,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Number(invoice.is_refund),
            original_invoice_id: invoice.original_invoice_id,
            original_invoice_number: invoice.original_invoice_number,
            collection_status: invoice.collection_status || 'pending',
            collection_method: invoice.collection_method || 'transfer',
            collection_date: invoice.collection_date,
            collection_reference: invoice.collection_reference,
            collection_notes: invoice.collection_notes,
            start_date: invoice.start_date,
            end_date: invoice.end_date,
            corresponding_month: invoice.corresponding_month,
            is_proportional: Number(invoice.is_proportional || 0),
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            client_identification: invoice.client_identification || null,
            client_company_name: invoice.client_company_name || null,
            client_address: invoice.client_address || null,
            client_postal_code: invoice.client_postal_code || null,
            client_location: invoice.client_location || null,
            client_province: invoice.client_province || null,
            client_country: invoice.client_country || null,
            client_phone: invoice.client_phone || null,
            owner_identification: invoice.owner_identification || null,
            owner_address: invoice.owner_address || null,
            owner_postal_code: invoice.owner_postal_code || null,
            owner_location: invoice.owner_location || null,
            owner_province: invoice.owner_province || null,
            owner_country: invoice.owner_country || null,
            owner_phone: invoice.owner_phone || null,
            estate_address: invoice.estate_name || null
        }));
    }

    // ==========================================
    // BÚSQUEDAS ESPECÍFICAS CON VALIDACIÓN
    // ==========================================

    /**
     * Busca una factura por su número
     */
    static async getInvoiceByNumber(invoice_number) {
        if (!invoice_number || invoice_number.trim().length === 0) return [];
        const invoices = await InvoicesIssuedRepository.findByInvoiceNumber(sanitizeString(invoice_number));
        if (!invoices.length) return [];

        const invoice = invoices[0];
        return [{
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            estates_id: invoice.estates_id,
            estate_name: invoice.estate_name,
            owners_id: invoice.owners_id,
            owner_name: invoice.owner_name,
            clients_id: invoice.clients_id,
            client_name: invoice.client_name,
            invoice_date: invoice.invoice_date,
            due_date: invoice.due_date,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            original_invoice_id: invoice.original_invoice_id,
            original_invoice_number: invoice.original_invoice_number,
            collection_status: invoice.collection_status || 'pending',
            collection_method: invoice.collection_method || 'transfer',
            collection_date: invoice.collection_date,
            collection_reference: invoice.collection_reference,
            collection_notes: invoice.collection_notes,
            start_date: invoice.start_date,
            end_date: invoice.end_date,
            corresponding_month: invoice.corresponding_month,
            is_proportional: Boolean(invoice.is_proportional),
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            client_identification: invoice.client_identification || null,
            client_company_name: invoice.client_company_name || null,
            client_address: invoice.client_address || null,
            client_postal_code: invoice.client_postal_code || null,
            client_location: invoice.client_location || null,
            client_province: invoice.client_province || null,
            client_country: invoice.client_country || null,
            client_phone: invoice.client_phone || null,
            owner_identification: invoice.owner_identification || null,
            owner_address: invoice.owner_address || null,
            owner_postal_code: invoice.owner_postal_code || null,
            owner_location: invoice.owner_location || null,
            owner_province: invoice.owner_province || null,
            owner_country: invoice.owner_country || null,
            owner_phone: invoice.owner_phone || null,
            estate_address: invoice.estate_name || null
        }];
    }

    /**
     * Busca una factura por su ID
     */
    static async getInvoiceById(id) {
        if (!id || isNaN(Number(id))) return [];
        const invoices = await InvoicesIssuedRepository.findById(id);
        if (!invoices || invoices.length === 0) return [];

        const invoice = invoices[0];
        return [{
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            estates_id: invoice.estates_id,
            estate_name: invoice.estate_name,
            owners_id: invoice.owners_id,
            owner_name: invoice.owner_name,
            clients_id: invoice.clients_id,
            client_name: invoice.client_name,
            invoice_date: invoice.invoice_date,
            due_date: invoice.due_date,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            original_invoice_id: invoice.original_invoice_id,
            original_invoice_number: invoice.original_invoice_number,
            collection_status: invoice.collection_status || 'pending',
            collection_method: invoice.collection_method || 'transfer',
            collection_date: invoice.collection_date,
            collection_reference: invoice.collection_reference,
            collection_notes: invoice.collection_notes,
            start_date: invoice.start_date,
            end_date: invoice.end_date,
            corresponding_month: invoice.corresponding_month,
            is_proportional: Boolean(invoice.is_proportional),
            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
            client_identification: invoice.client_identification || null,
            client_company_name: invoice.client_company_name || null,
            client_address: invoice.client_address || null,
            client_postal_code: invoice.client_postal_code || null,
            client_location: invoice.client_location || null,
            client_province: invoice.client_province || null,
            client_country: invoice.client_country || null,
            client_phone: invoice.client_phone || null,
            owner_identification: invoice.owner_identification || null,
            owner_address: invoice.owner_address || null,
            owner_postal_code: invoice.owner_postal_code || null,
            owner_location: invoice.owner_location || null,
            owner_province: invoice.owner_province || null,
            owner_country: invoice.owner_country || null,
            owner_phone: invoice.owner_phone || null,
            estate_address: invoice.estate_name || null
        }];
    }

    /**
     * Obtiene facturas por propietario
     */
    static async getByOwnersId(ownersId) {
        if (!ownersId || isNaN(ownersId)) return [];
        const invoices = await InvoicesIssuedRepository.findByOwnersId(ownersId);
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Obtiene facturas por cliente
     */
    static async getByClientsId(clientsId) {
        if (!clientsId || isNaN(clientsId)) return [];
        const invoices = await InvoicesIssuedRepository.findByClientId(clientsId);
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Historial de facturas por NIF del cliente
     */
    static async getInvoicesByClientNif(nif) {
        if (!nif || typeof nif !== 'string') return [];
        const invoices = await InvoicesIssuedRepository.findByClientNif(sanitizeString(nif));
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Busca facturas por estado de cobro
     */
    static async getInvoicesByCollectionStatus(status) {
        const validStatuses = CalculateHelper.getValidInvoicesIssuedStatuses();
        if (!validStatuses.includes(status)) return [];
        const invoices = await InvoicesIssuedRepository.findByCollectionStatus(status);
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Obtiene facturas vencidas
     */
    static async getOverdueInvoices() {
        const invoices = await InvoicesIssuedRepository.findOverdueInvoices();
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Obtiene facturas próximas a vencer
     */
    static async getInvoicesDueSoon(days = 7) {
        if (isNaN(Number(days)) || Number(days) < 1) days = 7;
        const invoices = await InvoicesIssuedRepository.findDueSoon(Number(days));
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Busca facturas por rango de fechas
     */
    static async getInvoicesByDateRange(startDate, endDate) {
        const validation = CalculateHelper.validateDateRange(startDate, endDate);
        if (!validation.isValid) return [];
        const invoices = await InvoicesIssuedRepository.findByDateRange(startDate, endDate);
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    /**
     * Busca facturas por mes de correspondencia
     */
    static async getInvoicesByCorrespondingMonth(correspondingMonth) {
        if (!correspondingMonth || !correspondingMonth.match(/^\d{4}-\d{2}$/)) return [];
        const invoices = await InvoicesIssuedRepository.findByCorrespondingMonth(correspondingMonth);
        return invoices.map(invoice => ({
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Boolean(invoice.is_proportional)
        }));
    }

    // ==========================================
    // CREAR NUEVA FACTURA EMITIDA
    // ==========================================

    /**
     * Crea una nueva factura emitida con validaciones completas
     */
    static async createInvoice(data) {
        const {owners_id, estates_id, clients_id, invoice_date, tax_base, iva, irpf} = data;

        // Validación de datos obligatorios
        if (!owners_id || !estates_id || !clients_id || !invoice_date) return [];


        // Validar campos proporcionales
        const proportionalValidation = CalculateHelper.validateProportionalFields(data);
        if (!proportionalValidation.isValid) return [];


        // REGLA DE NEGOCIO: Solo una factura por mes por owner+estate+client
        const existingInvoices = await InvoicesIssuedRepository.findByOwnersAndEstate(owners_id, estates_id);
        if (existingInvoices.length > 0) {
            const newInvoiceMonth = CalculateHelper.extractYearMonth(invoice_date);
            const sameMonthInvoice = existingInvoices.find(invoice => {
                const invoiceMonth = CalculateHelper.extractYearMonth(invoice.invoice_date);
                return invoiceMonth.year === newInvoiceMonth.year &&
                    invoiceMonth.month === newInvoiceMonth.month &&
                    invoice.clients_id === Number(clients_id) &&
                    !Boolean(invoice.is_refund);
            });
            if (sameMonthInvoice) return [];

        }

        // Obtener porcentaje de propiedad automáticamente
        const ownershipResult = await EstateOwnersRepository.getOwnershipPercent(estates_id, owners_id);
        const ownershipPercent = ownershipResult && ownershipResult.length > 0
            ? parseFloat(ownershipResult[0].ownership_percent) || 0
            : 0;

        // Generar número de factura secuencial
        const lastInvoiceNumber = await InvoicesIssuedRepository.getLastInvoiceNumber();
        let newInvoiceNumber = 'FACT-0001';
        if (lastInvoiceNumber.length > 0) {
            const lastNumber = parseInt(lastInvoiceNumber[0].invoice_number.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newInvoiceNumber = `FACT-${String(nextNumber).padStart(4, '0')}`;
        }

        // Calcular fecha de vencimiento si no se proporciona
        let dueDate = data.due_date;
        if (!dueDate) {
            const invoiceDateObj = new Date(invoice_date);
            invoiceDateObj.setDate(invoiceDateObj.getDate() + 30);
            dueDate = invoiceDateObj.toISOString().split('T')[0];
        }

        // Calcular total (normal o proporcional) usando CalculateHelper
        const calculationResult = CalculateHelper.calculateBillTotal(data);

        // Generar mes de correspondencia
        const correspondingMonth = CalculateHelper.generateCorrespondingMonth(invoice_date, data.corresponding_month);

        const invoiceData = {
            ...data,
            invoice_number: newInvoiceNumber,
            due_date: dueDate,
            ownership_percent: ownershipPercent,
            tax_base: calculationResult.details.proportional_base !== undefined ? parseFloat(calculationResult.details.proportional_base) : parseFloat(data.tax_base),
            iva: parseFloat(data.iva),
            irpf: parseFloat(data.irpf),
            total: calculationResult.total,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            corresponding_month: correspondingMonth,
            is_proportional: Number(data.is_proportional),
            collection_status: data.collection_status || 'pending',
            collection_method: data.collection_method || 'transfer',
            pdf_path: data.pdf_path || null,
            has_attachments: Boolean(data.has_attachments)
        };

        const created = await InvoicesIssuedRepository.create(invoiceData);
        if (!created.length > 0) return [];

        return [{...invoiceData, id: created[0].id}];
    }

    // ==========================================
    // ACTUALIZAR FACTURA EXISTENTE
    // ==========================================

    /**
     * Actualiza una factura existente
     */
    static async updateInvoice(id, updateData) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InvoicesIssuedRepository.findById(id);
        if (!existing || existing.length === 0) return [];

        // Validar campos proporcionales
        const proportionalValidation = CalculateHelper.validateProportionalFields({
            ...existing[0],
            ...updateData
        });
        if (!proportionalValidation.isValid) {
            return null;
        }

        // Validar que el nuevo número no esté duplicado y no sea el ID actual
        if (updateData.invoice_number !== undefined && updateData.invoice_number !== existing[0].invoice_number) {
            const invoiceWithSameNumber = await InvoicesIssuedRepository.findByInvoiceNumber(updateData.invoice_number);
            if (invoiceWithSameNumber.length > 0) return [];


        }

        // Recalcular ownership_percent si cambian owners_id o estates_id
        let updatedOwnershipPercent = parseFloat(existing[0].ownership_percent);
        const newOwnersId = updateData.owners_id !== undefined ? Number(updateData.owners_id) : existing[0].owners_id;
        const newEstatesId = updateData.estates_id !== undefined ? Number(updateData.estates_id) : existing[0].estates_id;

        if (newOwnersId !== existing[0].owners_id || newEstatesId !== existing[0].estates_id) {
            const ownershipResult = await EstatesOwnersRepository.getOwnershipPercent(newEstatesId, newOwnersId);
            updatedOwnershipPercent = ownershipResult && ownershipResult.length > 0
                ? parseFloat(ownershipResult[0].ownership_percent) || 0
                : 0;
        }

        // Recalcular total (normal o proporcional)
        const dataForCalculation = {
            tax_base: updateData.tax_base !== undefined ? parseFloat(updateData.tax_base) : parseFloat(existing[0].tax_base),
            iva: updateData.iva !== undefined ? parseFloat(updateData.iva) : parseFloat(existing[0].iva),
            irpf: updateData.irpf !== undefined ? parseFloat(updateData.irpf) : parseFloat(existing[0].irpf),
            is_proportional: updateData.is_proportional !== undefined ? Number(updateData.is_proportional || 0) : Number(existing[0].is_proportional || 0),
            start_date: updateData.start_date !== undefined ? updateData.start_date : existing[0].start_date,
            end_date: updateData.end_date !== undefined ? updateData.end_date : existing[0].end_date
        };

        const calculationResult = CalculateHelper.calculateBillTotal(dataForCalculation);

        // Generar mes de correspondencia actualizado
        const correspondingMonth = CalculateHelper.generateCorrespondingMonth(
            updateData.invoice_date || existing[0].invoice_date,
            updateData.corresponding_month
        );

        const cleanInvoiceData = {
            id,
            invoice_number: updateData.invoice_number ? sanitizeString(updateData.invoice_number) : existing[0].invoice_number,
            owners_id: newOwnersId,
            estates_id: newEstatesId,
            clients_id: updateData.clients_id !== undefined ? Number(updateData.clients_id) : existing[0].clients_id,
            invoice_date: updateData.invoice_date || existing[0].invoice_date,
            due_date: updateData.due_date !== undefined ? updateData.due_date : existing[0].due_date,
            tax_base: calculationResult.details.proportional_base !== undefined ? parseFloat(calculationResult.details.proportional_base) : dataForCalculation.tax_base,
            iva: dataForCalculation.iva,
            irpf: dataForCalculation.irpf,
            total: calculationResult.total,
            ownership_percent: updatedOwnershipPercent,
            collection_status: updateData.collection_status || existing[0].collection_status,
            collection_method: updateData.collection_method || existing[0].collection_method,
            collection_date: updateData.collection_date !== undefined ? updateData.collection_date : existing[0].collection_date,
            collection_reference: updateData.collection_reference !== undefined ? updateData.collection_reference : existing[0].collection_reference,
            collection_notes: updateData.collection_notes !== undefined ? updateData.collection_notes : existing[0].collection_notes,
            start_date: dataForCalculation.start_date,
            end_date: dataForCalculation.end_date,
            corresponding_month: correspondingMonth,
            is_proportional: dataForCalculation.is_proportional,
            pdf_path: updateData.pdf_path !== undefined ? updateData.pdf_path : existing[0].pdf_path,
            has_attachments: updateData.has_attachments !== undefined ? Boolean(updateData.has_attachments) : Boolean(existing[0].has_attachments)
        };

        try {
            const updated = await InvoicesIssuedRepository.update(cleanInvoiceData);
            return updated;
        } catch (error) {
            return null;
        }
    }

    /**
     * Elimina factura
     */
    static async deleteInvoice(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InvoicesIssuedRepository.findById(id);
        if (!existing.length > 0) return [];

        // TODO: Regla de negocio: ¿Se puede eliminar si tiene abonos asociados?
        // Esto requeriría un método en el repositorio como `hasRefundsAssociated(invoiceId)`.

        const result = await InvoicesIssuedRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }

    // ========================================
    // GESTIÓN DE ABONOS/REEMBOLSOS
    // ========================================

    /**
     * Obtiene todos los abonos con formato estandarizado
     */
    static async getAllRefunds() {
        const refunds = await InvoicesIssuedRepository.getAllRefunds();

        return refunds.map(refund => ({
            id: refund.id,
            invoice_number: refund.invoice_number,
            estates_id: refund.estates_id,
            estate_name: refund.estate_name,
            clients_id: refund.clients_id,
            client_name: refund.client_name,
            owners_id: refund.owners_id,
            owner_name: refund.owner_name,
            ownership_percent: parseFloat(refund.ownership_percent),
            invoice_date: refund.invoice_date,
            tax_base: parseFloat(refund.tax_base),
            iva: parseFloat(refund.iva),
            irpf: parseFloat(refund.irpf),
            total: parseFloat(refund.total),
            is_refund: Boolean(refund.is_refund),
            original_invoice_id: refund.original_invoice_id,
            original_invoice_number: refund.original_invoice_number,
            start_date: refund.start_date,
            end_date: refund.end_date,
            corresponding_month: refund.corresponding_month,
            is_proportional: Boolean(refund.is_proportional),
            created_at: refund.created_at,
            updated_at: refund.updated_at
        }));
    }

    /**
     * Factura con detalles completos para impresión
     */
    static async getInvoiceWithDetails(id) {
        if (!id || isNaN(Number(id))) return [];
        const invoiceDetails = await InvoicesIssuedRepository.findByIdWithDetails(id);
        if (!invoiceDetails || invoiceDetails.length === 0) return [];

        const invoice = invoiceDetails[0];

        return [{
            ...invoice,
            tax_base: parseFloat(invoice.tax_base),
            iva: parseFloat(invoice.iva),
            irpf: parseFloat(invoice.irpf),
            total: parseFloat(invoice.total),
            ownership_percent: parseFloat(invoice.ownership_percent),
            is_refund: Boolean(invoice.is_refund),
            is_proportional: Number(invoice.is_proportional || 0)
        }];
    }

    /**
     * Abono con detalles completos para impresión
     */
    static async getRefundWithDetails(id) {
        if (!id || isNaN(Number(id))) return [];
        const refundDetails = await InvoicesIssuedRepository.findRefundByIdWithDetails(id);
        if (!refundDetails || refundDetails.length === 0) return [];

        const refund = refundDetails[0];
        return [{
            ...refund,
            tax_base: parseFloat(refund.tax_base),
            iva: parseFloat(refund.iva),
            irpf: parseFloat(refund.irpf),
            total: parseFloat(refund.total),
            ownership_percent: parseFloat(refund.ownership_percent),
            is_refund: Boolean(refund.is_refund),
            is_proportional: Boolean(refund.is_proportional)
        }];
    }

    /**
     * Crea abono (factura negativa) basado en factura original
     */
    static async createRefund(originalInvoiceId) {
        if (!originalInvoiceId || isNaN(Number(originalInvoiceId))) return null;

        // Obtener factura original
        const originalInvoice = await InvoicesIssuedRepository.findById(originalInvoiceId);
        if (!originalInvoice.length) return [];

        // REGLA: No se puede hacer abono de un abono
        if (Boolean(originalInvoice[0].is_refund)) return null;

        // Generar número de abono secuencial
        const lastRefundNumber = await InvoicesIssuedRepository.getLastRefundNumber();
        let newRefundNumber = 'ABONO-0001';
        if (lastRefundNumber.length > 0) {
            const lastNumber = parseInt(lastRefundNumber[0].invoice_number.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newRefundNumber = `ABONO-${String(nextNumber).padStart(4, '0')}`;
        }

        // Crear abono con valores negativos y campos proporcionales heredados
        const refundToCreate = {
            invoice_number: newRefundNumber,
            estates_id: originalInvoice[0].estates_id,
            owners_id: originalInvoice[0].owners_id,
            clients_id: originalInvoice[0].clients_id,
            invoice_date: new Date().toISOString().split('T')[0],
            tax_base: -Math.abs(parseFloat(originalInvoice[0].tax_base)),
            iva: parseFloat(originalInvoice[0].iva),
            irpf: parseFloat(originalInvoice[0].irpf),
            total: -Math.abs(parseFloat(originalInvoice[0].total)),
            ownership_percent: parseFloat(originalInvoice[0].ownership_percent),
            original_invoice_id: originalInvoice[0].id,
            collection_status: 'pending',
            collection_method: 'transfer',
            collection_date: null,
            collection_reference: null,
            collection_notes: `Abono de factura ${originalInvoice[0].invoice_number}`,
            start_date: originalInvoice[0].start_date,
            end_date: originalInvoice[0].end_date,
            corresponding_month: originalInvoice[0].corresponding_month,
            is_proportional: Number(originalInvoice[0].is_proportional || 0)
        };

        const newRefundId = await InvoicesIssuedRepository.createRefund(refundToCreate);
        return newRefundId.length > 0 ? newRefundId : [];
    }

    // ==========================================
    // GESTIÓN DE COBROS
    // ==========================================

    /**
     * Actualiza el estado de cobro de una factura
     */
    static async updateCollectionStatus(id, collectionData) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InvoicesIssuedRepository.findById(id);
        if (!existing.length > 0) return [];

        const validStatuses = CalculateHelper.getValidInvoicesIssuedStatuses();
        if (!validStatuses.includes(collectionData.collection_status)) {
            return null;
        }

        const validMethods = CalculateHelper.getValidPaymentMethods();
        if (collectionData.collection_method && !validMethods.includes(collectionData.collection_method)) {
            return null;
        }

        if (collectionData.collection_status === 'collected' && !collectionData.collection_date) {
            collectionData.collection_date = new Date().toISOString().split('T')[0];
        }

        if (collectionData.collection_status === 'pending') {
            collectionData.collection_date = null;
            collectionData.collection_reference = null;
        }

        const updated = await InvoicesIssuedRepository.updateCollectionStatus(Number(id), collectionData);
        if (!updated.length) return [];

        const updatedInvoice = await InvoicesIssuedRepository.findById(id);
        return updatedInvoice;
    }

    // ==========================================
    // ESTADÍSTICAS Y REPORTES
    // ==========================================

    /**
     * Obtiene estadísticas generales
     */
    static async getInvoiceStats() {
        const stats = await InvoicesIssuedRepository.getStats();
        return {
            total_invoices: stats.total_invoices || 0,
            pending_invoices: stats.pending_invoices || 0,
            collected_invoices: stats.collected_invoices || 0,
            overdue_invoices: stats.overdue_invoices || 0,
            total_amount: parseFloat(stats.total_amount) || 0,
            total_iva_repercutido: parseFloat(stats.total_iva_repercutido) || 0,
            total_irpf_retenido: parseFloat(stats.total_irpf_retenido) || 0,
            pending_amount: parseFloat(stats.pending_amount) || 0,
            percentage_collected: stats.total_invoices > 0 ?
                Math.round((stats.collected_invoices / stats.total_invoices) * 100) : 0
        };
    }

    /**
     * Obtiene estadísticas por cliente
     */
    static async getStatsByClient() {
        return await InvoicesIssuedRepository.getStatsByClient();
    }

    /**
     * Obtiene estadísticas por propietario
     */
    static async getStatsByOwner() {
        return await InvoicesIssuedRepository.getStatsByOwner();
    }

    /**
     * Obtiene datos para el libro de IVA repercutido
     */
    static async getVATBookData(year, month = null) {
        if (!year || isNaN(Number(year))) return [];

        const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
            ? Number(month) : null;

        return await InvoicesIssuedRepository.getForVATBook(Number(year), validMonth);
    }

    /**
     * Obtiene balance de ingresos
     */
    static async getIncomeStatement(year, month = null) {
        if (!year || isNaN(Number(year))) return [];

        const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
            ? Number(month) : null;

        return await InvoicesIssuedRepository.getIncomeStatement(Number(year), validMonth);
    }

    /**
     * Obtiene resumen mensual de facturación
     */
    static async getMonthlySummary(year) {
        if (!year || isNaN(Number(year))) return [];
        return await InvoicesIssuedRepository.getMonthlySummary(Number(year));
    }

    /**
     * Obtiene facturas pendientes con aging (antigüedad)
     */
    static async getPendingInvoicesAging() {
        return await InvoicesIssuedRepository.getPendingInvoicesAging();
    }

    // ==========================================
    // MÉTODOS PROPORCIONALES
    // ==========================================

    /**
     * Obtiene detalles de cálculo de una factura proporcional
     */
    static async getProportionalCalculationDetails(invoiceId) {
        const invoice = await InvoicesIssuedRepository.findById(invoiceId);
        if (!invoice.length) return null;

        const invoiceData = invoice[0];
        return CalculateHelper.getCalculationDetails(invoiceData);
    }

}