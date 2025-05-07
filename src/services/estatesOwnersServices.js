import EstateOwnersRepository from "../repository/estatesOwnersRepository.js";

export default class EstateOwnersService {

    // Obtener todos
    static async getAllEstateOwners() {
        return await EstateOwnersRepository.getAll();
    }

    // Crear
    static async createEstateOwners(data) {
        const {estate_id, owners_id, ownership_precent} = data;

        const existing = await EstateOwnersRepository.findByEstateAndOwners(estate_id, owners_id);
        if (existing && existing.length > 0) return null;

        const created = await EstateOwnersRepository.create(estate_id, owners_id, ownership_precent);
        return created ? true : null;
    }

    // Actualizar
    static async updateEstateOwners(estate_id, owners_id, ownership_precent) {
        if (!estate_id || !owners_id || ownership_precent === undefined) return null;

        const existing = await EstateOwnersRepository.findById(estate_id, owners_id);
        if (!existing) return null;

        const updated = await EstateOwnersRepository.update(estate_id, owners_id, ownership_precent);
        return updated ? true : null;
    }

    // Eliminar
    static async deleteEstateOwners(estate_id, owners_id) {
        if (!estate_id || !owners_id) return null;

        return await EstateOwnersRepository.delete(estate_id, owners_id);
    }
}