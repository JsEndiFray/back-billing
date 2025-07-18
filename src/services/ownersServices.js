import OwnersRepository from "../repository/ownersRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

/**
 * Servicio de propietarios
 * Maneja personas físicas o jurídicas que poseen inmuebles
 */
export default class OwnersServices {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllOwners() {
        return await OwnersRepository.getAll();
    }

    static async getAllForDropdownOwners() {
        return await OwnersRepository.getAllForDropdown();
    }

    // ========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ========================================

    /**
     * Búsqueda por prioridad secuencial
     * 1. Busca por nombre → si encuentra, devuelve resultado
     * 2. Busca por apellido → si encuentra, devuelve resultado
     * 3. Busca por identificación → devuelve resultado
     *
     * NO es búsqueda combinada (name AND lastname AND identification)
     * ES búsqueda por prioridad (name OR lastname OR identification)
     */
    static async getOwner(name, lastname, identification) {
        if (!name && !lastname && !identification) return [];

        // Prioridad 1: Identificación (solo si no encontró por nombre/apellido)
        if (identification) {
            return await OwnersRepository.findByIdentification(sanitizeString(identification));
        }
        return [];

        // Prioridad 2: Nombre
        if (name) {
            const owner = await OwnersRepository.findByName(sanitizeString(name));
            if (owner.length > 0) return owner;
        }

        // Prioridad 3: Apellido (solo si no encontró por nombre)
        if (lastname) {
            const owner = await OwnersRepository.findByLastname(sanitizeString(lastname));
            if (owner.length > 0) return owner;
        }


    }

    static async getOwnerById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await OwnersRepository.findById(id);
    }

    // ========================================
    // CRUD CON SANITIZACIÓN
    // ========================================

    /**
     * Crear propietario con sanitización y validación de duplicados
     */
    static async createOwner(data) {
        const ownersData = {
            name: data.name?.toUpperCase().trim(),
            lastname: data.lastname?.toUpperCase().trim(),
            email: data.email?.toLowerCase().trim(),
            identification: data.identification?.toUpperCase().trim(),
            phone: data.phone?.trim(),
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
        }

        // Validar identificación única
        const existing = await OwnersRepository.findByIdentification(ownersData.identification);
        if (existing.length > 0) return [];

        const created = await OwnersRepository.create(ownersData);
        if (!created.length > 0) return [];

        return [{...ownersData, id: created[0].id}];
    }

    /**
     * Actualizar propietario con validación de duplicados
     */
    static async updateOwner(id, data) {
        if (!id || isNaN(Number(id))) return [];

        const cleanOwnersData = {
            id: Number(id),
            name: data.name?.toUpperCase().trim(),
            lastname: data.lastname?.toUpperCase().trim(),
            email: data.email?.toLowerCase().trim(),
            identification: data.identification?.toUpperCase().trim(),
            phone: data.phone?.trim(),
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
        };

        // Verificar que existe
        const existing = await OwnersRepository.findById(cleanOwnersData.id);
        if (!existing.length > 0) return [];

        // Validar identificación única (excepto este mismo propietario)
        if (cleanOwnersData.identification) {
            const ownerWithSameIdentification = await OwnersRepository.findByIdentification(cleanOwnersData.identification);
            if (ownerWithSameIdentification.length > 0 && ownerWithSameIdentification[0].id !== Number(id)) {
                return [];
            }
        }

        const updated = await OwnersRepository.update(cleanOwnersData);
        return updated.length > 0 ? [cleanOwnersData] : [];
    }

    static async deleteOwner(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await OwnersRepository.findById(id);
        if (!existing.length > 0) return [];

        const result = await OwnersRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
        ;
    }
}

/**
 * CARACTERÍSTICAS:
 * 1. Búsqueda por PRIORIDAD (no combinada): nombre → apellido → identificación
 * 2. Sanitización consistente: uppercase/lowercase según campo
 * 3. Validación de identificación única
 * 4. PATRÓN CONSISTENTE: SIEMPRE arrays - [] para errores, [datos] para éxito
 */