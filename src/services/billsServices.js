import BillsRepository from "../repository/billsRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";
import EstatesOwnersRepository from "../repository/estatesOwnersRepository.js";
import {format} from "morgan";
import {calculateTotal} from "../helpers/calculateTotal.js";
import {calculateProportionalTotal, calculateDaysBetween} from "../helpers/calculateTotal.js";
import {ProportionalBillingHelper} from "../helpers/ProportionalBillingHelper.js";

/**
 * Servicio de facturas - capa de lógica de negocio
 * ACTUALIZADO: Incluye lógica para facturación proporcional
 * Orquesta operaciones complejas usando repositorios
 */
export default class BillsService {

    /**
     * Obtiene todas las facturas con formato estandarizado y con metodos de pagos
     * ACTUALIZADO: Incluye nuevos campos proporcionales
     */
    static async getAllBills() {
        const bills = await BillsRepository.getAll();

        // Transforma datos del repositorio a formato de API
        return bills.map(bill => ({
            id: bill.id,
            bill_number: bill.bill_number,
            estates_id: bill.estate_name,
            owners_id: bill.owner_name,
            clients_id: bill.client_name,
            date: bill.date,
            tax_base: bill.tax_base,
            iva: bill.iva,
            irpf: bill.irpf,
            total: bill.total,
            ownership_percent: bill.ownership_percent,
            is_refund: bill.is_refund,
            original_bill_id: bill.original_bill_id,
            original_bill_number: bill.original_bill_number,
            payment_status: bill.payment_status || 'pending',
            payment_method: bill.payment_method || 'transfer',
            payment_date: bill.payment_date,
            payment_notes: bill.payment_notes,
            // 🆕 NUEVOS CAMPOS PROPORCIONALES
            start_date: bill.start_date,
            end_date: bill.end_date,
            corresponding_month: bill.corresponding_month,
            is_proportional: bill.is_proportional,
            date_create: bill.date_create,
            date_update: bill.date_update
        }));
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA CON VALIDACIÓN
    // ========================================

    /**
     * Busca factura por número con validación
     */
    static async getBillByNumber(bill_number) {
        if (!bill_number.length) return [];
        return await BillsRepository.findByBillNumber(bill_number);
    }

    /**
     * Busca factura por ID con validación de tipo
     */
    static async getBillById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await BillsRepository.findById(id);
    }

    /**
     * Facturas por propietario
     */
    static async getByOwnersId(ownersId) {
        if (!ownersId || isNaN(ownersId)) return [];
        return await BillsRepository.findByOwnersId(ownersId);
    }

    /**
     * Facturas por cliente
     */
    static async getByClientsId(clientsId) {
        if (!clientsId || isNaN(clientsId)) return [];
        return await BillsRepository.findByClientId(clientsId);
    }

    /**
     * Historial de facturas por NIF del cliente
     */
    static async getBillsByClientNif(nif) {
        if (!nif || typeof nif !== 'string') return [];
        return await BillsRepository.findByClientNif(sanitizeString(nif));
    }

    // ========================================
    // LÓGICA DE NEGOCIO COMPLEJA
    // ========================================

    /**
     * Crea factura con validaciones y cálculos automáticos
     * ACTUALIZADO: Incluye lógica proporcional
     */
    static async createBill(data) {
        const {owners_id, estates_id, date, tax_base, iva, irpf} = data;

        // Validación de datos obligatorios
        if (!owners_id || !estates_id || !date) {
            return [];
        }

        // 🆕 VALIDAR CAMPOS PROPORCIONALES
        const proportionalValidation = ProportionalBillingHelper.validateProportionalFields(data);
        if (!proportionalValidation.isValid) {
            throw new Error(proportionalValidation.message);
        }

        // REGLA DE NEGOCIO: Solo una factura por mes por owner+estate
        const existingBills = await BillsRepository.findByOwnersAndEstate(owners_id, estates_id);
        if (existingBills.length > 0) {
            const newBillMonth = format(new Date(date), 'yyyy-MM');
            const sameMonthBill = existingBills.find(bill => {
                const billMonth = format(new Date(bill.date), 'yyyy-MM');
                return billMonth === newBillMonth;
            });
            if (sameMonthBill) {
                return null; // Ya existe factura en ese mes
            }
        }

        // Obtener porcentaje de propiedad automáticamente
        const ownershipResult = await EstatesOwnersRepository.getOwnershipPercent(estates_id, owners_id);
        const ownershipPercent = ownershipResult && ownershipResult.length > 0
            ? ownershipResult[0].ownership_percent || 0
            : 0;

        // Generar número de factura secuencial
        const lastBillNumber = await BillsRepository.getLastBillNumber();
        let newBillNumber = 'FACT-0001';
        if (lastBillNumber.length > 0) {
            const lastNumber = parseInt(lastBillNumber[0].bill_number.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newBillNumber = `FACT-${String(nextNumber).padStart(4, '0')}`;
        }

        // 🆕 CALCULAR TOTAL (normal o proporcional)
        const calculationResult = ProportionalBillingHelper.calculateBillTotal(data);

        // 🆕 GENERAR MES DE CORRESPONDENCIA
        const correspondingMonth = ProportionalBillingHelper.generateCorrespondingMonth(date, data.corresponding_month);

        const billToCreate = {
            ...data,
            bill_number: newBillNumber,
            ownership_percent: ownershipPercent,
            total: calculationResult.total,
            // 🆕 CAMPOS PROPORCIONALES CON VALORES POR DEFECTO
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            corresponding_month: correspondingMonth,
            is_proportional: data.is_proportional || 0
        };

        const newBillId = await BillsRepository.create(billToCreate);
        return newBillId.length > 0 ? newBillId : [];
    }

    /**
     * Actualiza factura con validaciones
     * ACTUALIZADO: Incluye lógica proporcional
     */
    static async updateBill(id, updateData) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await BillsRepository.findById(id);
        if (!existing.length > 0) return [];

        // 🆕 VALIDAR CAMPOS PROPORCIONALES
        const proportionalValidation = ProportionalBillingHelper.validateProportionalFields(updateData);
        if (!proportionalValidation.isValid) {
            throw new Error(proportionalValidation.message);
        }

        // Validar que el nuevo número no esté duplicado
        if (updateData.bill_number) {
            const billWithSameNumber = await BillsRepository.findByBillNumber(updateData.bill_number);
            if (billWithSameNumber.length > 0 && billWithSameNumber[0].id !== Number(id)) {
                return [];
            }
        }

        // 🆕 RECALCULAR TOTAL (normal o proporcional)
        const dataForCalculation = {
            tax_base: updateData.tax_base || existing[0].tax_base,
            iva: updateData.iva || existing[0].iva,
            irpf: updateData.irpf || existing[0].irpf,
            is_proportional: updateData.is_proportional !== undefined ? updateData.is_proportional : existing[0].is_proportional,
            start_date: updateData.start_date || existing[0].start_date,
            end_date: updateData.end_date || existing[0].end_date
        };

        const calculationResult = ProportionalBillingHelper.calculateBillTotal(dataForCalculation);

        // 🆕 GENERAR MES DE CORRESPONDENCIA ACTUALIZADO
        const correspondingMonth = ProportionalBillingHelper.generateCorrespondingMonth(
            updateData.date || existing[0].date,
            updateData.corresponding_month
        );

        const billToUpdate = {
            id,
            bill_number: updateData.bill_number || existing[0].bill_number,
            owners_id: updateData.owners_id,
            clients_id: updateData.clients_id,
            date: updateData.date,
            tax_base: updateData.tax_base,
            iva: updateData.iva,
            irpf: updateData.irpf,
            total: calculationResult.total, // 🆕 TOTAL RECALCULADO
            ownership_percent: updateData.ownership_percent !== null && updateData.ownership_percent !== undefined
                ? updateData.ownership_percent
                : existing[0].ownership_percent,
            payment_status: updateData.payment_status || existing[0].payment_status,
            payment_method: updateData.payment_method || existing[0].payment_method,
            payment_date: updateData.payment_date || existing[0].payment_date,
            payment_notes: updateData.payment_notes || existing[0].payment_notes,
            // 🆕 NUEVOS CAMPOS PROPORCIONALES
            start_date: updateData.start_date !== undefined ? updateData.start_date : existing[0].start_date,
            end_date: updateData.end_date !== undefined ? updateData.end_date : existing[0].end_date,
            corresponding_month: correspondingMonth,
            is_proportional: updateData.is_proportional !== undefined ? updateData.is_proportional : existing[0].is_proportional
        };

        try {
            const updated = await BillsRepository.update(billToUpdate);
            return updated.length > 0 ? updated : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Elimina factura
     */
    static async deleteBill(id) {
        if (!id || isNaN(Number(id))) return [];
        const result = await BillsRepository.delete(id);
        return result;
    }

    // ========================================
    // GESTIÓN DE ABONOS/REEMBOLSOS
    // ========================================

    /**
     * Obtiene todos los abonos con formato estandarizado
     * ACTUALIZADO: Incluye nuevos campos proporcionales
     */
    static async getAllRefunds() {
        const refunds = await BillsRepository.getAllRefunds();

        return refunds.map(refund => ({
            id: refund.id,
            bill_number: refund.bill_number,
            estates_id: refund.estates_id,
            clients_id: refund.clients_id,
            owners_id: refund.owners_id,
            ownership_percent: refund.ownership_percent,
            date: refund.date,
            tax_base: refund.tax_base,
            iva: refund.iva,
            irpf: refund.irpf,
            total: refund.total,
            is_refund: refund.is_refund,
            original_bill_id: refund.original_bill_id,
            original_bill_number: refund.original_bill_number,
            // 🆕 CAMPOS PROPORCIONALES EN ABONOS
            start_date: refund.start_date,
            end_date: refund.end_date,
            corresponding_month: refund.corresponding_month,
            is_proportional: refund.is_proportional,
            date_create: refund.date_create,
            date_update: refund.date_update
        }));
    }

    /**
     * Factura con detalles completos para impresión
     */
    static async getBillWithDetails(id) {
        if (!id || isNaN(Number(id))) return [];
        const bill = await BillsRepository.findByIdWithDetails(id);
        if (!bill.length) return [];
        return bill;
    }

    /**
     * Abono con detalles completos para impresión
     */
    static async getRefundWithDetails(id) {
        if (!id || isNaN(Number(id))) return [];
        const refund = await BillsRepository.findRefundByIdWithDetails(id);
        if (!refund.length) return [];
        return refund;
    }

    /**
     * Crea abono (factura negativa) basado en factura original
     * ACTUALIZADO: Hereda campos proporcionales de la factura original
     */
    static async createRefund(originalBillId) {

        if (!originalBillId || isNaN(Number(originalBillId))) {
            return null;
        }

        // Obtener factura original
        const originalBill = await BillsRepository.findById(originalBillId);
        if (!originalBill.length) {
            return [];
        }

        // REGLA: No se puede hacer abono de un abono
        if (originalBill[0].is_refund) {
            return [];
        }

        // Generar número de abono secuencial
        const lastRefundNumber = await BillsRepository.getLastRefundNumber();
        let newRefundNumber = 'ABONO-0001';
        if (lastRefundNumber.length > 0) {
            const lastNumber = parseInt(lastRefundNumber[0].bill_number.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newRefundNumber = `ABONO-${String(nextNumber).padStart(4, '0')}`;
        }

        // Crear abono con valores negativos Y campos proporcionales heredados
        const refundToCreate = {
            bill_number: newRefundNumber,
            estates_id: originalBill[0].estates_id,
            owners_id: originalBill[0].owners_id,
            clients_id: originalBill[0].clients_id,
            date: new Date(),
            tax_base: -Math.abs(originalBill[0].tax_base),
            iva: originalBill[0].iva,
            irpf: originalBill[0].irpf,
            total: -Math.abs(originalBill[0].total),
            ownership_percent: originalBill[0].ownership_percent,
            original_bill_id: originalBill[0].id,
            payment_status: 'pending',
            payment_method: 'transfer',
            payment_date: null,
            payment_notes: `Abono de factura ${originalBill[0].bill_number}`,
            // 🆕 HEREDAR CAMPOS PROPORCIONALES DE LA FACTURA ORIGINAL
            start_date: originalBill[0].start_date,
            end_date: originalBill[0].end_date,
            corresponding_month: originalBill[0].corresponding_month,
            is_proportional: originalBill[0].is_proportional
        };

        const newRefundId = await BillsRepository.createRefund(refundToCreate);
        return newRefundId.length > 0 ? newRefundId : [];
    }

    /**
     * PATRÓN DE ARQUITECTURA:
     * Repository -> Acceso a datos
     * Service -> Lógica de negocio + validaciones + orquestación
     * Controller -> Manejo HTTP + respuestas
     */


    // ========================================
    // GESTIÓN DE PAGOS
    // ========================================

    /**
     * Actualiza el estado de pago de una factura con validaciones
     * @param {number} id - ID de la factura
     * @param {Object} paymentData - Datos del pago
     * @returns {Object|null} Factura actualizada o null si hay error
     */
    static async updatePaymentStatus(id, paymentData) {
        // Validar ID
        if (!id || isNaN(Number(id))) return [];

        // Validar que la factura existe
        const existing = await BillsRepository.findById(id);
        if (!existing.length > 0) return [];

        // Validar estados permitidos
        const validStatuses = ['pending', 'paid'];
        if (!validStatuses.includes(paymentData.payment_status)) {
            return null;
        }

        // Validar métodos permitidos
        const validMethods = ['direct_debit', 'cash', 'card', 'transfer'];
        if (!validMethods.includes(paymentData.payment_method)) {
            return null;
        }

        // REGLA DE NEGOCIO: Si se marca como pagado, debe tener fecha
        if (paymentData.payment_status === 'paid' && !paymentData.payment_date) {
            paymentData.payment_date = new Date().toISOString().split('T')[0]; // Hoy
        }

        // REGLA DE NEGOCIO: Si se marca como pendiente, limpiar fecha de pago
        if (paymentData.payment_status === 'pending') {
            paymentData.payment_date = null;
        }

        // Actualizar en base de datos
        const updated = await BillsRepository.updatePaymentStatus(Number(id), paymentData);
        if (!updated.length) return [];

        // Devolver la factura actualizada
        const updatedBill = await BillsRepository.findById(id);
        return updatedBill;
    }

    // ========================================
    // 🆕 MÉTODO PARA OBTENER DETALLES DE CÁLCULO PROPORCIONAL
    // ========================================

    /**
     * 🆕 Obtiene detalles de cálculo de una factura proporcional
     * @param {number} billId - ID de la factura
     * @returns {Object} Detalles del cálculo proporcional
     */
    static async getProportionalCalculationDetails(billId) {
        const bill = await BillsRepository.findById(billId);
        if (!bill.length) return null;

        const billData = bill[0];
        return ProportionalBillingHelper.getCalculationDetails(billData);
    }

}

