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
        const rows = await EstateOwnersRepository.getAll();
        return rows;
    }

    /**
     * Crea relación propiedad-propietario
     * REGLA: No duplicar combinación estate_id + owners_id
     */
    static async createEstateOwners(data) {
        const { estate_id, owners_id, ownership_percentage  } = data;

        // Validar que no exista ya esta combinación
        const existing = await EstateOwnersRepository.findByEstateAndOwners(estate_id, owners_id);
        if (existing && existing.length > 0) return null;

        const created = await EstateOwnersRepository.create(estate_id, owners_id, ownership_percentage);
        return created ? true : null;
    }

    /**
     * Actualiza porcentaje de propiedad por ID único
     */
    static async updateEstateOwners(id, ownership_percentage) {
        if (!id || ownership_percentage === undefined) return null;

        // Verificar que existe
        const existing = await EstateOwnersRepository.findById(id);
        if (!existing) return null;

        const updated = await EstateOwnersRepository.updateById(id, ownership_percentage);
        return updated ? true : null;
    }

    /**
     * Elimina relación por ID único
     */
    static async deleteEstateOwners(id) {
        if (!id) return null;
        return await EstateOwnersRepository.deleteById(id);
    }
}

/**
 * NOTA: Servicio simple - principalmente validaciones básicas
 * Podrías agregar validación de que porcentajes no excedan 100% por propiedad
 */