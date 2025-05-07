import BillsRepository from "../repository/billsRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";
import EstatesOwnersRepository from "../repository/estatesOwnersRepository.js";
import {format} from "morgan";

export default class BillsService {

    //obtener las facturas
    static async getAllBills() {
        return await BillsRepository.getAll();
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
        const {owners_id, estate_id, date} = data;
        if (!owners_id || !estate_id || !date) {
            return null; //Datos incompletos
        }
        // Buscar todas las facturas del mismo owner y estate
        const existingBills = await BillsRepository.findByOwnersAndEstate(owners_id, estate_id);
        if (existingBills.length > 0) {
            // Comprobar si alguna factura es del mismo mes y año
            const newBillMonth = format(new Date(date), 'yyyy-MM'); //Ej: "2025-04"
            const sameMonthBill = existingBills.find(bill => {
                const billMonth = format(new Date(bill.date), 'yyyy-MM');
                return billMonth === newBillMonth;
            });
            if (sameMonthBill) {
                return null;
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
        const billToCreate = {
            ...data,
            bill_number: newBillNumber,
            ownership_percent: ownershipPercent
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
                return null; // número de factura duplicado
            }
        }

        const billToUpdate = {
            id,
            bill_number: updateData.bill_number || existing.bill_number, //recupera el bill_number si no viene
            owners_id: updateData.owners_id,
            clients_id: updateData.clients_id,
            date: updateData.date,
            tax_base: updateData.tax_base,
            iva: updateData.iva,
            irpf: updateData.irpf,
            total: updateData.total
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


}