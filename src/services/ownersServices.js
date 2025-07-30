import OwnersRepository from "../repository/ownersRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";

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


    // ==========================================
    // 🆕 GESTIÓN DE DISTRIBUCIÓN DE PORCENTAJES
    // ==========================================

    /**
     * Obtiene la distribución de propietarios y sus porcentajes para una propiedad
     * @param {number} estateId - ID de la propiedad
     * @returns {Array} Array con propietarios y sus porcentajes
     *
     * @example
     * // Retorna: [
     * //   { ownerId: 1, ownerName: "Juan Pérez", percentage: 33.33 },
     * //   { ownerId: 2, ownerName: "María García", percentage: 33.33 },
     * //   { ownerId: 3, ownerName: "Carlos López", percentage: 33.34 }
     * // ]
     */
    static async getOwnershipDistribution(estateId) {
        // Validar que estateId sea válido
        if (!estateId || isNaN(Number(estateId))) {
            return [];
        }

        // 1. Obtener todas las relaciones estate-owner para esta propiedad
        const estateOwnersData = await EstateOwnersRepository.getAll();

        // 2. Filtrar solo los de esta propiedad
        const propertyOwners = estateOwnersData.filter(
            relation => relation.estate_id === Number(estateId)
        );

        // 3. Si no hay propietarios para esta propiedad
        if (!propertyOwners || propertyOwners.length === 0) {
            return [];
        }

        // 4. Formatear los datos de respuesta
        const distribution = propertyOwners.map(relation => ({
            ownerId: relation.owners_id,
            ownerName: relation.owner_name, // Ya viene del JOIN
            estateName: relation.estate_name, // Ya viene del JOIN
            percentage: parseFloat(relation.ownership_percentage),
            estateId: relation.estate_id,
            relationId: relation.id // ID de la relación en estate_owners
        }));

        return distribution;
    }

    /**
     * Valida que los porcentajes de una propiedad sumen exactamente 100%
     * @param {number} estateId - ID de la propiedad
     * @returns {Object} {isValid: boolean, totalPercentage: number, message: string}
     */
    static async validateOwnershipPercentages(estateId) {
        if (!estateId || isNaN(Number(estateId))) {
            return {
                isValid: false,
                totalPercentage: 0,
                message: 'ID de propiedad inválido'
            };
        }

        // Obtener distribución
        const distribution = await this.getOwnershipDistribution(estateId);

        if (distribution.length === 0) {
            return {
                isValid: false,
                totalPercentage: 0,
                message: 'No hay propietarios asignados a esta propiedad'
            };
        }

        // Sumar todos los porcentajes
        const totalPercentage = distribution.reduce((sum, owner) => {
            return sum + owner.percentage;
        }, 0);

        // Redondear a 2 decimales para evitar problemas de precisión
        const roundedTotal = Math.round(totalPercentage * 100) / 100;

        // Validar que sea exactamente 100%
        const isValid = roundedTotal === 100.00;

        return {
            isValid,
            totalPercentage: roundedTotal,
            message: isValid
                ? 'Porcentajes válidos'
                : `Los porcentajes suman ${roundedTotal}% en lugar de 100%`,
            ownersCount: distribution.length,
            distribution // Incluir la distribución para debug
        };
    }

    /**
     * Calcula la parte de un propietario en un importe específico
     * @param {number} amount - Importe total a distribuir
     * @param {number} ownerId - ID del propietario
     * @param {number} estateId - ID de la propiedad
     * @returns {number} Parte correspondiente al propietario
     *
     * @example
     * // calculateOwnerShare(1000, 1, 1) → 333.33 (si tiene 33.33%)
     */
    static async calculateOwnerShare(amount, ownerId, estateId) {
        // Validaciones básicas
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return 0;
        }

        if (!ownerId || isNaN(Number(ownerId))) {
            return 0;
        }

        if (!estateId || isNaN(Number(estateId))) {
            return 0;
        }

        // Obtener distribución de la propiedad
        const distribution = await this.getOwnershipDistribution(estateId);

        // Buscar el propietario específico
        const ownerData = distribution.find(owner => owner.ownerId === Number(ownerId));

        if (!ownerData) {
            return 0; // Propietario no encontrado en esta propiedad
        }

        // Calcular su parte
        const ownerShare = (Number(amount) * ownerData.percentage) / 100;

        // Redondear a 2 decimales
        return Math.round(ownerShare * 100) / 100;
    }

    /**
     * Obtiene todos los propietarios con sus propiedades y porcentajes
     * @returns {Array} Array con todos los propietarios y sus propiedades
     */
    static async getAllOwnersWithEstates() {
        const estateOwnersData = await EstateOwnersRepository.getAll();

        if (!estateOwnersData || estateOwnersData.length === 0) {
            return [];
        }

        // Agrupar por propietario
        const ownersMap = {};

        estateOwnersData.forEach(relation => {
            const ownerId = relation.owners_id;

            if (!ownersMap[ownerId]) {
                ownersMap[ownerId] = {
                    ownerId: ownerId,
                    ownerName: relation.owner_name,
                    estates: [],
                    totalEstates: 0
                };
            }

            ownersMap[ownerId].estates.push({
                estateId: relation.estate_id,
                estateName: relation.estate_name,
                percentage: parseFloat(relation.ownership_percentage),
                relationId: relation.id
            });

            ownersMap[ownerId].totalEstates++;
        });

        // Convertir a array
        return Object.values(ownersMap);
    }
}
/**
 * CARACTERÍSTICAS ORIGINALES:
 * 1. Búsqueda por PRIORIDAD (no combinada): nombre → apellido → identificación
 * 2. Sanitización consistente: uppercase/lowercase según campo
 * 3. Validación de identificación única
 * 4. PATRÓN CONSISTENTE: SIEMPRE arrays - [] para errores, [datos] para éxito
 *
 * 🆕 NUEVAS CARACTERÍSTICAS:
 * 5. Gestión de distribución de porcentajes por propiedad
 * 6. Validación de que los porcentajes sumen 100%
 * 7. Cálculo de partes individuales por propietario
 * 8. Vista consolidada de propietarios con sus propiedades
 */
