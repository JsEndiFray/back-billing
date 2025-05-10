import EstateOwnersRepository from "../repository/estatesOwnersRepository.js";

export default class EstateOwnersService {

    // Obtener todos
    static async getAllEstateOwners() {
        const rows = await EstateOwnersRepository.getAll();
        return rows.map(row => ({
            id: row.id, // <-- NUEVO: incluir ID en la respuesta
            estate: {
                id: row.estate_id,
                name: row.estate_name
            },
            owner: {
                id: row.owners_id,
                name: row.owner_name
            },
            ownership_percent: row.ownership_precent,
            createdAt: row.date_create,
            updatedAt: row.date_update
        }));
    }

    // Crear
    static async createEstateOwners(data) {
        const { estate_id, owners_id, ownership_precent } = data;

        const existing = await EstateOwnersRepository.findByEstateAndOwners(estate_id, owners_id);
        if (existing && existing.length > 0) return null;

        const created = await EstateOwnersRepository.create(estate_id, owners_id, ownership_precent);
        return created ? true : null;
    }

    // Actualizar por ID ÚNICO
    static async updateEstateOwners(id, ownership_precent) {
        if (!id || ownership_precent === undefined) return null;

        const existing = await EstateOwnersRepository.findById(id);
        if (!existing) return null;

        const updated = await EstateOwnersRepository.updateById(id, ownership_precent);
        return updated ? true : null;
    }

    // Eliminar por ID ÚNICO
    static async deleteEstateOwners(id) {
        if (!id) return null;

        return await EstateOwnersRepository.deleteById(id);
    }
}