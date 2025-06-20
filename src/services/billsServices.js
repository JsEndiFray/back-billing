import BillsRepository from "../repository/billsRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";
import EstatesOwnersRepository from "../repository/estatesOwnersRepository.js";
import {format} from "morgan";
import {calculateTotal} from "../helpers/calculateTotal.js";

/**
 * Servicio de facturas - capa de lógica de negocio
 * Orquesta operaciones complejas usando repositorios
 */
export default class BillsService {

    /**
     * Obtiene todas las facturas con formato estandarizado
     */
    static async getAllBills() {
        const bills = await BillsRepository.getAll();

        // Transforma datos del repositorio a formato de API
        return bills.map(bill => ({
            id: bill.id,
            bill_number: bill.bill_number,
            estates_id: bill.estate_name,      // Alias más limpio
            owners_id: bill.owner_name,          // Alias más limpio
            clients_id: bill.client_name,        // Alias más limpio
            date: bill.date,
            tax_base: bill.tax_base,
            iva: bill.iva,
            irpf: bill.irpf,
            total: bill.total,
            ownership_percent: bill.ownership_percent,
            is_refund: bill.is_refund,
            original_bill_id: bill.original_bill_id,
            original_bill_number: bill.original_bill_number,
            date_create: bill.date_create,     // Formato camelCase
            date_update: bill.date_update      // Formato camelCase
        }));
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA CON VALIDACIÓN
    // ========================================

    /**
     * Busca factura por número con validación
     */
    static async getBillByNumber(bill_number) {
        if (!bill_number) return null;
        return await BillsRepository.findByBillNumber(bill_number);
    }

    /**
     * Busca factura por ID con validación de tipo
     */
    static async getBillById(id) {
        if (!id || isNaN(Number(id))) return null;
        return await BillsRepository.findById(id);
    }

    /**
     * Facturas por propietario
     */
    static async getByOwnersId(ownersId) {
        if (!ownersId || isNaN(ownersId)) return null;
        return await BillsRepository.findByOwnersId(ownersId);
    }

    /**
     * Facturas por cliente
     */
    static async getByClientsId(clientsId) {
        if (!clientsId || isNaN(clientsId)) return null;
        return await BillsRepository.findByClientId(clientsId);
    }

    /**
     * Historial de facturas por NIF del cliente
     */
    static async getBillsByClientNif(nif) {
        if (!nif || typeof nif !== 'string') return null;
        return await BillsRepository.findByClientNif(sanitizeString(nif));
    }

    // ========================================
    // LÓGICA DE NEGOCIO COMPLEJA
    // ========================================

    /**
     * Crea factura con validaciones y cálculos automáticos
     */
    static async createBill(data) {
        const {owners_id, estates_id, date, tax_base, iva, irpf} = data;

        // Validación de datos obligatorios
        if (!owners_id || !estates_id || !date) {
            return null;
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
        const ownershipPercent = await EstatesOwnersRepository.getOwnershipPercent(estates_id, owners_id);

        // Generar número de factura secuencial
        const lastBillNumber = await BillsRepository.getLastBillNumber();
        let newBillNumber = 'FACT-0001';
        if (lastBillNumber) {
            const lastNumber = parseInt(lastBillNumber.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newBillNumber = `FACT-${String(nextNumber).padStart(4, '0')}`;
        }

        // Calcular total automáticamente
        const total = calculateTotal(tax_base, iva, irpf);

        const billToCreate = {
            ...data,
            bill_number: newBillNumber,
            ownership_percent: ownershipPercent,
            total
        };

        const newBillId = await BillsRepository.create(billToCreate);
        return {id: newBillId, ...billToCreate};
    }

    /**
     * Actualiza factura con validaciones
     */
    static async updateBill(id, updateData) {
        if (!id || isNaN(Number(id))) return null;

        const existing = await BillsRepository.findById(id);
        if (!existing) return null;

        // Validar que el nuevo número no esté duplicado
        if (updateData.bill_number) {
            const billWithSameNumber = await BillsRepository.findByBillNumber(updateData.bill_number);
            if (billWithSameNumber && billWithSameNumber.id !== Number(id)) {
                return null; // Número duplicado
            }
        }

        // Recalcular total automáticamente
        const total = calculateTotal(updateData.tax_base, updateData.iva, updateData.irpf);

        const billToUpdate = {
            id,
            bill_number: updateData.bill_number || existing.bill_number,
            owners_id: updateData.owners_id,
            clients_id: updateData.clients_id,
            date: updateData.date,
            tax_base: updateData.tax_base,
            iva: updateData.iva,
            irpf: updateData.irpf,
            total,
            ownership_percent: updateData.ownership_percent
        };

        const updated = await BillsRepository.update(billToUpdate);
        return updated ? billToUpdate : null;
    }

    /**
     * Elimina factura
     */
    static async deleteBill(id) {
        if (!id || isNaN(Number(id))) return null;
        const result = await BillsRepository.delete(id);
        return result > 0;
    }

    // ========================================
    // GESTIÓN DE ABONOS/REEMBOLSOS
    // ========================================

    /**
     * Obtiene todos los abonos con formato estandarizado
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
            original_bill_number: refund.original_bill_number,  // Referencia a factura original
            date_create: refund.date_create,
            date_update: refund.date_update
        }));
    }

    /**
     * Factura con detalles completos para impresión
     */
    static async getBillWithDetails(id) {
        if (!id || isNaN(Number(id))) return null;
        const bill = await BillsRepository.findByIdWithDetails(id);
        if (!bill) return null;
        return bill;
    }

    /**
     * Abono con detalles completos para impresión
     */
    static async getRefundWithDetails(id) {
        if (!id || isNaN(Number(id))) return null;
        const refund = await BillsRepository.findRefundByIdWithDetails(id);
        if (!refund) return null;
        return refund;
    }

    /**
     * Crea abono (factura negativa) basado en factura original
     */
    static async createRefund(originalBillId) {
        if (!originalBillId || isNaN(Number(originalBillId))) {
            return null;
        }

        // Obtener factura original
        const originalBill = await BillsRepository.findById(originalBillId);
        if (!originalBill) {
            return null;
        }

        // REGLA: No se puede hacer abono de un abono
        if (originalBill.is_refund) {
            return null;
        }

        // Generar número de abono secuencial
        const lastRefundNumber = await BillsRepository.getLastRefundNumber();
        let newRefundNumber = 'ABONO-0001';
        if (lastRefundNumber) {
            const lastNumber = parseInt(lastRefundNumber.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newRefundNumber = `ABONO-${String(nextNumber).padStart(4, '0')}`;
        }

        // Crear abono con valores negativos
        const refundToCreate = {
            bill_number: newRefundNumber,
            estates_id: originalBill.estates_id,
            owners_id: originalBill.owners_id,
            clients_id: originalBill.clients_id,
            date: new Date(),
            tax_base: -Math.abs(originalBill.tax_base),    // Negativo
            iva: originalBill.iva,                         // Porcentaje se mantiene
            irpf: originalBill.irpf,                       // Porcentaje se mantiene
            total: -Math.abs(originalBill.total),          // Negativo
            ownership_percent: originalBill.ownership_percent,
            original_bill_id: originalBill.id
        };

        const newRefundId = await BillsRepository.createRefund(refundToCreate);
        return {id: newRefundId, ...refundToCreate};
    }
}

/**
 * PATRÓN DE ARQUITECTURA:
 * Repository -> Acceso a datos
 * Service -> Lógica de negocio + validaciones + orquestación
 * Controller -> Manejo HTTP + respuestas
 */