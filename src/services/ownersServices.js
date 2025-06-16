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
        if (!name && !lastname && !identification) return null;

        // Prioridad 1: Nombre
        if (name) {
            const owner = await OwnersRepository.findByName(sanitizeString(name));
            if (owner.length) return owner;
        }

        // Prioridad 2: Apellido (solo si no encontró por nombre)
        if (lastname) {
            const owner = await OwnersRepository.findByLastname(sanitizeString(lastname));
            if (owner.length) return owner;
        }

        // Prioridad 3: Identificación (solo si no encontró por nombre/apellido)
        if (identification) {
            return await OwnersRepository.findByIdentification(sanitizeString(identification));
        }
        return null;
    }

    static async getOwnerId(id) {
        if (!id || isNaN(Number(id))) return null; // ✅ Corregido: && → ||
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
        if (existing) return null; // ✅ Corregido: consistente con otros servicios

        const ownerID = await OwnersRepository.create(ownersData);
        if (!ownerID) return null;

        return ownersData;
    }

    /**
     * Actualizar propietario con validación de duplicados
     */
    static async updateOwner(id, data) {
        if (!id || isNaN(Number(id))) return null;

        const cleanOwnerData = {
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
        }

        // Verificar que existe
        const existing = await OwnersRepository.findById(cleanOwnerData.id);
        if (!existing) return null;

        // Validar identificación única (excepto este mismo propietario)
        if (cleanOwnerData.identification) {
            const ownerWithSameIdentification = await OwnersRepository.findByIdentification(cleanOwnerData.identification);
            if (ownerWithSameIdentification && ownerWithSameIdentification.id !== Number(id)) {
                return null; // Identificación duplicada
            }
        }

        const updated = await OwnersRepository.update(cleanOwnerData);
        return updated ? cleanOwnerData : null;
    }

    static async deleteOwner(id) {
        if (!id || isNaN(Number(id))) return null;

        const existing = await OwnersRepository.findById(id);
        if (!existing) return null;

        const result = await OwnersRepository.delete(id);
        return result > 0;
    }
}

/**
 * CARACTERÍSTICAS:
 * 1. Búsqueda por PRIORIDAD (no combinada): nombre → apellido → identificación
 * 2. Sanitización consistente: uppercase/lowercase según campo
 * 3. Validación de identificación única
 * 4. Patrón limpio: null para errores, datos para éxito
 */