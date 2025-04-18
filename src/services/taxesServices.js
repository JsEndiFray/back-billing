import TaxesRepository from "../repository/taxesRepository.js";
import {sanitizeString} from "../utils/stringHelpers.js";

export default class TaxesService {

    //obtener las facturas
    static async getAllTaxes() {
        return await TaxesRepository.getAll();
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por numero de factura.
    static async getBillByNumber(bill_number) {
        if (!bill_number) return null;
        return await TaxesRepository.findByBillNumber(bill_number);
    }

    //búsqueda por ID
    static async getTaxById(id) {
        if (!id || isNaN(id)) return null;
        return await TaxesRepository.findById(id);
    }

    //búsqueda por id_owners
    static async getByOwnersId(ownersId) {
        if (!ownersId || isNaN(ownersId)) return null;
        return await TaxesRepository.findByOwnersId(ownersId);
    }

    //búsqueda por id_cliente
    static async getByClientsId(clientsId) {
        if (!clientsId || isNaN(clientsId)) return null;
        return await TaxesRepository.findByClientId(clientsId);
    }


    //BÚSQUEDA HISTORIAL FACTURA POR NIF

    // búsqueda por NIF del cliente
    static async getBillsByClientNif(nif) {
        if (!nif || typeof nif !== 'string') return null;
        return await TaxesRepository.findByClientNif(sanitizeString(nif));
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear FACTURAS
    static async createTaxes(data) {
        const {bill_number} = data;
        //verificamos si existe facturas
        const existing = await TaxesRepository.findByBillNumber(bill_number);
        if (existing && existing.length > 0) return null;
        const newTaxes = await TaxesRepository.create(data);
        return {id: newTaxes, ...data}
    }

    //actualizar facturas
    static async updateTaxes(data) {
        if (!data.id || isNaN(data.id)) return null;
        //verificamos si existe facturas
        const existing = await TaxesRepository.findById(data.id);
        if (!existing) return null;
        // Actualizar
        const updatedTaxes = await TaxesRepository.update(data);
        return updatedTaxes ? data : null;
    }

    //ELIMINAR FACTURAS
    static async deleteTaxes(id) {
        if (!id || isNaN(id)) return null;
        return await TaxesRepository.delete(id);
    }


}