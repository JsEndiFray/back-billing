import EstateRepository from "../repository/estateRepository.js";
import {sanitizeString} from "../utils/stringHelpers.js";

export default class EstateServices {

    //obtener los inmuebles
    static async getAllEstate() {
        return await EstateRepository.getAll();
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda de inmueble con el catastro.
    static async getByCadastralReference(cadastral_reference) {
        if (!cadastral_reference || typeof cadastral_reference !== 'string') return null;

        const refNormalized = sanitizeString(cadastral_reference);
        if (!refNormalized || refNormalized.length === 0) return null;

        return await EstateRepository.findByCadastralReference(refNormalized);


    }

    //búsqueda de inmuebles con el ID
    static async getById(id) {
        if (!id || isNaN(id)) return null;
        return await EstateRepository.findById(id);
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear inmuebles
    static async createEstate(estate) {
        //verificamos antes si existe antes de crear
        const {cadastral_reference} = estate;
        const existing = await EstateRepository.findByCadastralReference(cadastral_reference);
        if (existing && existing.length > 0) return null;

        const estateID = await EstateRepository.create(estate);
        if (!estateID) return null;
        return {estateID, estate} || null;
    }

    //actualizar usuarios
    static async updateEstate(estate) {
        if (!estate.id || isNaN(estate.id)) return null;
        //verificamos antes si existe antes de actualizar
        const existing = await EstateRepository.findById(estate.id);
        if (!existing) return null;

        const {cadastral_reference} = estate;
        const duplicate = await EstateRepository.findByCadastralReference(cadastral_reference);
        if (duplicate && duplicate.length > 0) {
            const duplicateId = duplicate[0].id;
            if (Number(duplicateId) !== Number(estate.id)) {
                // Si existe otro inmueble con esa referencia -> error
                return null;
            }
        }

        const updated = await EstateRepository.update(estate);
        return updated ? estate : null;
    }

    //eliminar usuarios
    static async deleteService(id) {
        if (!id || isNaN(id)) return null;
        //verificamos antes si existe antes de eliminar
        const existing = await EstateRepository.findById(id);
        if (!existing) return null;

        const result = await EstateRepository.delete(id);
        return result > 0;
    }


}