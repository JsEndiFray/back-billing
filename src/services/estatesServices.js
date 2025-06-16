import EstatesRepository from "../repository/estatesRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

/**
 * Servicio de propiedades inmobiliarias
 * Validaciones y sanitización de datos
 */
export default class EstatesServices {

    static async getAllEstate() {
        return await EstatesRepository.getAll();
    }

    static async getAllForDropdownEstates() {
        return await EstatesRepository.getAllForDropdown();
    }

    // ========================================
    // BÚSQUEDAS CON VALIDACIÓN
    // ========================================

    /**
     * Busca por referencia catastral con sanitización
     */
    static async getByCadastralReference(cadastral_reference) {
        if (!cadastral_reference || typeof cadastral_reference !== 'string') return null;

        const refNormalized = sanitizeString(cadastral_reference);
        if (!refNormalized || refNormalized.length === 0) return null;

        return await EstatesRepository.findByCadastralReference(refNormalized);
    }

    static async getById(id) {
        if (!id || isNaN(Number(id))) return null;
        return await EstatesRepository.findById(id);
    }

    // ========================================
    // CRUD CON VALIDACIONES
    // ========================================

    /**
     * Crea propiedad con validación de duplicados
     * REGLA: Referencia catastral única
     */
    static async createEstate(estate) {
        // Limpiar datos
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

        // Verificar referencia catastral única
        const existing = await EstatesRepository.findByCadastralReference(estatesData.cadastral_reference);
        if (existing && existing.length > 0) return null;

        const estateID = await EstatesRepository.create(estatesData);
        if (!estateID) return null;
        return {estateID, estatesData};
    }

    /**
     * Actualiza propiedad con validación de duplicados
     */
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

        // Verificar que existe
        const existing = await EstatesRepository.findById(cleanEstateData.id);
        if (!existing) return null;

        // Verificar referencia catastral única (excepto esta misma propiedad)
        const {cadastral_reference} = data;
        const duplicate = await EstatesRepository.findByCadastralReference(cadastral_reference);
        if (duplicate && duplicate.length > 0) {
            const duplicateId = duplicate[0].id;
            if (Number(duplicateId) !== Number(cleanEstateData.id)) {
                return null; // Referencia duplicada
            }
        }

        const updated = await EstatesRepository.update(cleanEstateData);
        return updated ? cleanEstateData : null;
    }

    /**
     * Elimina propiedad
     * Nota: Método llamado deleteService en lugar de deleteEstate
     */
    static async deleteEstate(id) {
        if (!id || isNaN(Number(id))) return null;

        // Verificar que existe
        const existing = await EstatesRepository.findById(id);
        if (!existing) return null;

        const result = await EstatesRepository.delete(id);
        return result > 0;
    }
}

/**
 * REGLA PRINCIPAL: Referencia catastral única por propiedad
 */