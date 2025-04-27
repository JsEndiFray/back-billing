import BillsRepository from "../repository/billsRepository.js";
import {sanitizeString} from "../utils/stringHelpers.js";

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
        if (!id || isNaN(id)) return null;
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
        const {bill_number} = data;
        //verificamos si existe facturas
        const existing = await BillsRepository.findByBillNumber(bill_number);
        if (existing && existing.length > 0) return null;
        const newTaxes = await BillsRepository.create(data);
        return {id: newTaxes, ...data}
    }

    //actualizar facturas
    static async updateBill(data) {
        if (!data.id || isNaN(data.id)) return null;
        //verificamos si existe facturas
        const existing = await BillsRepository.findById(data.id);
        if (!existing) return null;
        // Actualizar
        const updatedTaxes = await BillsRepository.update(data);
        return updatedTaxes ? data : null;
    }

    //ELIMINAR FACTURAS
    static async deleteBill(id) {
        if (!id || isNaN(id)) return null;
        return await BillsRepository.delete(id);
    }


}