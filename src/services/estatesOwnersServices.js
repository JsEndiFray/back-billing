import EstateOwnersRepository from "../repository/estatesOwnersRepository.js";

/**
 * Servicio para gestionar relaciones propiedad-propietario
 * Capa simple de validación sobre el repositorio
 */
export default class EstateOwnersService {

    /**
     * Obtiene todas las relaciones con JOINs de nombres
     */
    static async getAllEstateOwners() {
        return await EstateOwnersRepository.getAll();

    };

    /**
     * Busca relación por ID único
     */
    static async getEstateOwnerById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await EstateOwnersRepository.findById(id);
    };

    /**
     * Crea relación propiedad-propietario
     * REGLA: No duplicar combinación estate_id + owners_id
     */
    static async createEstateOwners(data) {
        const {estate_id, owners_id, ownership_percentage} = data;

        // Validar que no exista ya esta combinación
        const existing = await EstateOwnersRepository.findByEstateAndOwners(estate_id, owners_id);
        if (existing.length > 0) return [];

        const created = await EstateOwnersRepository.create(estate_id, owners_id, ownership_percentage);
        if (!created.length) return [];

        return [{id: created[0].id, estate_id, owners_id, ownership_percentage, created: true}];

    }

    /**
     * Actualiza porcentaje de propiedad por ID único
     */
    static async updateEstateOwner(id, ownership_percentage) {
        // Validaciones de entrada
        if (!id || ownership_percentage === undefined || ownership_percentage === null) return [];

        // Validar que el porcentaje esté en rango válido
        if (typeof ownership_percentage !== 'number' || ownership_percentage < 0 || ownership_percentage > 100) {
            return [];
        }

        // Verificar que existe
        const existing = await EstateOwnersRepository.findById(id);
        if (!existing.length) return [];

        // Actualizar en la base de datos
        const updated = await EstateOwnersRepository.updateById(id, ownership_percentage);

        return updated.length > 0 ? [{id: Number(id), ownership_percentage, updated: true}] : [];
    }

    /**
     * Elimina relación por ID único
     */
    static async deleteEstateOwners(id) {
        // Validar ID
        if (!id || isNaN(Number(id))) return [];

        // Verificar que existe la relación
        const existing = await EstateOwnersRepository.findById(id);
        if (!existing.length) return [];

        const deleted = await EstateOwnersRepository.deleteById(id);
        return deleted.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }
}

/**
 * ✅ PATRÓN CONSISTENTE APLICADO:
 * - Arrays [] para duplicados/errores
 * - Arrays [data] para éxito
 * - Verificaciones .length > 0 para arrays
 * - REGLA: No duplicar combinación estate_id + owners_id
 * - Podrías agregar validación de que porcentajes no excedan 100% por propiedad
 */