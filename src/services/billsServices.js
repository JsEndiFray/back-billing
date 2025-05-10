import BillsRepository from "../repository/billsRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";
import EstatesOwnersRepository from "../repository/estatesOwnersRepository.js";
import {format} from "morgan";
import {calculateTotal} from "../helpers/calculateTotal.js";

export default class BillsService {

    //obtener las facturas
    static async getAllBills() {
        const bills = await BillsRepository.getAll();

        return bills.map(bill => ({
            id: bill.id,
            bill_number: bill.bill_number,
            property: bill.estate_name,
            owner: bill.owner_name,
            client: bill.client_name,
            date: bill.date,
            tax_base: bill.tax_base,
            iva: bill.iva,
            irpf: bill.irpf,
            total: bill.total,
            ownership_percent: bill.ownership_percent,
            createdAt: bill.date_create,
            updatedAt: bill.date_update
        }));
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por numero de factura.
    static async getBillByNumber(bill_number) {
        if (!bill_number) return null;
        return await BillsRepository.findByBillNumber(bill_number);
    }

    //búsqueda por ID
    static async getBillById(id) {
        if (!id || isNaN(Number(id))) return null;
        return await BillsRepository.findById(id);
    }

    //búsqueda por id_owners
    static async getByOwnersId(ownersId) {
        if (!ownersId || isNaN(ownersId)) return null;
        return await BillsRepository.findByOwnersId(ownersId);
    }

    //búsqueda por id_cliente
    static async getByClientsId(clientsId) {
        if (!clientsId || isNaN(clientsId)) return null;
        return await BillsRepository.findByClientId(clientsId);
    }


    //BÚSQUEDA HISTORIAL FACTURA POR NIF

    // búsqueda por NIF del cliente
    static async getBillsByClientNif(nif) {
        if (!nif || typeof nif !== 'string') return null;
        return await BillsRepository.findByClientNif(sanitizeString(nif));
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear FACTURAS
    static async createBill(data) {
        const {owners_id, estate_id, date, tax_base, iva, irpf} = data;

        if (!owners_id || !estate_id || !date) {
            return null; //Datos incompletos
        }

        // Buscar todas las facturas del mismo owner y estate
        const existingBills = await BillsRepository.findByOwnersAndEstate(owners_id, estate_id);
        if (existingBills.length > 0) {
            const newBillMonth = format(new Date(date), 'yyyy-MM');
            const sameMonthBill = existingBills.find(bill => {
                const billMonth = format(new Date(bill.date), 'yyyy-MM');
                return billMonth === newBillMonth;
            });
            if (sameMonthBill) {
                return null; //Ya existe factura en ese mes
            }
        }
        const ownershipPercent = await EstatesOwnersRepository.getOwnershipPercent(estate_id, owners_id);
        //Generar número de factura automático
        const lastBillNumber = await BillsRepository.getLastBillNumber();
        let newBillNumber = 'FACT-0001';
        if (lastBillNumber) {
            const lastNumber = parseInt(lastBillNumber.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newBillNumber = `FACT-${String(nextNumber).padStart(4, '0')}`;
        }
        //CALCULAR TOTAL aseguramos que es decimal
        const total = calculateTotal(tax_base, iva, irpf);

        const billToCreate = {
            ...data,
            bill_number: newBillNumber,
            ownership_percent: ownershipPercent,
            total //calculado automáticamente
        };

        const newBillId = await BillsRepository.create(billToCreate);
        return {id: newBillId, ...billToCreate};
    }

    //actualizar facturas
    static async updateBill(id, updateData) {
        if (!id || isNaN(Number(id))) return null;

        const existing = await BillsRepository.findById(id);
        if (!existing) return null;

        //comprobar si el nuevo bill_number está en uso por otra factura
        if (updateData.bill_number) {
            const billWithSameNumber = await BillsRepository.findByBillNumber(updateData.bill_number);

            if (billWithSameNumber && billWithSameNumber.id !== Number(id)) {
                return null; //número de factura duplicado
            }
        }
        //calcular el total de forma automática
        const total = calculateTotal(updateData.tax_base, updateData.iva, updateData.irpf);

        const billToUpdate = {
            id,
            bill_number: updateData.bill_number || existing.bill_number, //si no viene, se mantiene
            owners_id: updateData.owners_id,
            clients_id: updateData.clients_id,
            date: updateData.date,
            tax_base: updateData.tax_base,
            iva: updateData.iva,
            irpf: updateData.irpf,
            total, //total calculado automático
            ownership_percent: updateData.ownership_percent
        };

        const updated = await BillsRepository.update(billToUpdate);
        return updated ? billToUpdate : null;
    }

    //ELIMINAR FACTURAS
    static async deleteBill(id) {
        if (!id || isNaN(Number(id))) return null;
        const result = await BillsRepository.delete(id);
        return result > 0;
    }

    //NUEVOS METODOS DE INCORPORACION

    //--------------------------------------------------------------------------------------------


    // Obtener todos los abonos
    static async getAllRefunds() {
        const refunds = await BillsRepository.getAllRefunds();

        return refunds.map(refund => ({
            id: refund.id,
            bill_number: refund.bill_number,
            property: refund.estate_name,
            owner: refund.owner_name,
            client: refund.client_name,
            date: refund.date,
            tax_base: refund.tax_base,
            iva: refund.iva,
            irpf: refund.irpf,
            total: refund.total,
            ownership_percent: refund.ownership_percent,
            original_bill_id: refund.original_bill_id,
            original_bill_number: refund.original_bill_number,
            createdAt: refund.date_create,
            updatedAt: refund.date_update
        }));
    }

    // DESCARGA FACTURAS
    static async getBillWithDetails(id) {
        if (!id || isNaN(Number(id))) return null;

        // Obtener factura con detalles de cliente, propietario e inmueble
        const bill = await BillsRepository.findByIdWithDetails(id);
        if (!bill) return null;

        return bill;
    }
    // DESCARGA FACTURA ABONO
    static async getRefundWithDetails(id) {
        if (!id || isNaN(Number(id))) return null;

        // Obtener abono con detalles
        const refund = await BillsRepository.findRefundByIdWithDetails(id);
        if (!refund) return null;

        return refund;
    }



    // Crear un abono
    static async createRefund(originalBillId) {
        if (!originalBillId || isNaN(Number(originalBillId))) {
            return null;
        }

        // 1. Obtener la factura original
        const originalBill = await BillsRepository.findById(originalBillId);
        if (!originalBill) {
            return null; // Factura original no encontrada
        }

        // Verificar que la factura original no sea ya un abono
        if (originalBill.is_refund) {
            return null; // No se puede hacer un abono de un abono
        }

        // 2. Generar número de abono automático
        const lastRefundNumber = await BillsRepository.getLastRefundNumber();
        let newRefundNumber = 'ABONO-0001';
        if (lastRefundNumber) {
            const lastNumber = parseInt(lastRefundNumber.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newRefundNumber = `ABONO-${String(nextNumber).padStart(4, '0')}`;
        }

        // 3. Crear el abono con valores negativos
        const refundToCreate = {
            bill_number: newRefundNumber,
            estate_id: originalBill.estate_id,
            owners_id: originalBill.owners_id,
            clients_id: originalBill.clients_id,
            date: new Date(), // Fecha actual
            tax_base: -Math.abs(originalBill.tax_base), // Negativo
            iva: originalBill.iva, // El porcentaje se mantiene igual
            irpf: originalBill.irpf, // El porcentaje se mantiene igual
            total: -Math.abs(originalBill.total), // Negativo
            ownership_percent: originalBill.ownership_percent,
            original_bill_id: originalBill.id
        };

        const newRefundId = await BillsRepository.createRefund(refundToCreate);
        return {id: newRefundId, ...refundToCreate};
    }


}