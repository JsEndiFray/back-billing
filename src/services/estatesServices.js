import EstatesRepository from "../repository/estatesRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

export default class EstatesServices {

    //obtener los inmuebles
    static async getAllEstate() {
        return await EstatesRepository.getAll();
    }
    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdownEstates() {
        return await EstatesRepository.getAllForDropdown();
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda de inmueble con el catastro.
    static async getByCadastralReference(cadastral_reference) {
        if (!cadastral_reference || typeof cadastral_reference !== 'string') return null;

        const refNormalized = sanitizeString(cadastral_reference);
        if (!refNormalized || refNormalized.length === 0) return null;

        return await EstatesRepository.findByCadastralReference(refNormalized);


    }

    //búsqueda de inmuebles con el ID
    static async getById(id) {
        if (!id || isNaN(Number(id))) return null;
        return await EstatesRepository.findById(id);
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear inmuebles
    static async createEstate(estate) {
        //verificamos antes si existe antes de crear
        const {cadastral_reference} = estate;
        const existing = await EstatesRepository.findByCadastralReference(cadastral_reference);
        if (existing && existing.length > 0) return null;

        const estateID = await EstatesRepository.create(estate);
        if (!estateID) return null;
        return {estateID, estate};
    }

    //actualizar usuarios
    static async updateEstate(estate) {
        if (!estate.id || isNaN(estate.id)) return null;
        //verificamos antes si existe antes de actualizar
        const existing = await EstatesRepository.findById(estate.id);
        if (!existing) return null;

        const {cadastral_reference} = estate;
        const duplicate = await EstatesRepository.findByCadastralReference(cadastral_reference);
        if (duplicate && duplicate.length > 0) {
            const duplicateId = duplicate[0].id;
            if (Number(duplicateId) !== Number(estate.id)) {
                // Si existe otro inmueble con esa referencia -> error
                return null;
            }
        }

        const updated = await EstatesRepository.update(estate);
        return updated ? estate : null;
    }

    //eliminar usuarios
    static async deleteService(id) {
        if (!id || isNaN(Number(id))) return null;
        //verificamos antes si existe antes de eliminar
        const existing = await EstatesRepository.findById(id);
        if (!existing) return null;

        const result = await EstatesRepository.delete(id);
        return result > 0;
    }


}