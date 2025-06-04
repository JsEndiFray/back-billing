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
        const estatesData = {
            cadastral_reference: estate.cadastral_reference?.toUpperCase().trim(),
            price: estate.price,
            address: estate.address?.toUpperCase().trim(),
            postal_code: estate.postal_code?.trim(),
            location: estate.location?.toUpperCase().trim(),
            province: estate.province?.toUpperCase().trim(),
            country: estate.country?.toUpperCase().trim(),
            surface: estate.surface,
        };
        const existing = await EstatesRepository.findByCadastralReference(estatesData.cadastral_reference);
        if (existing && existing.length > 0) return null;

        const estateID = await EstatesRepository.create(estatesData);
        if (!estateID) return null;
        return {estateID, estatesData};
    }

    //actualizar usuarios
    static async updateEstate(id, data) {
        if (!id || isNaN(id)) return null;

        const cleanEstateData = {
            id: Number(id),
            cadastral_reference: data.cadastral_reference?.toUpperCase().trim(),
            price: data.price,
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
            surface: data.surface,
        };
        //verificamos antes si existe antes de actualizar
        const existing = await EstatesRepository.findById(cleanEstateData.id);
        if (!existing) return null;

        const {cadastral_reference} = data;
        const duplicate = await EstatesRepository.findByCadastralReference(cadastral_reference);
        if (duplicate && duplicate.length > 0) {
            const duplicateId = duplicate[0].id;
            if (Number(duplicateId) !== Number(cleanEstateData.id)) {
                // Si existe otro inmueble con esa referencia -> error
                return null;
            }
        }

        const updated = await EstatesRepository.update(cleanEstateData);
        return updated ? cleanEstateData : null;
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