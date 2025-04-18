import EstateRepository from "../repository/estateRepository.js";

export default class EstateServices {

    //obtener los datos de los servicios
    static async getAllServices() {
        return await EstateRepository.getAll();
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda de los servicios
    static async getEstateId(id) {
        if (!id || isNaN(id)) return null;
        return await EstateRepository.findById(id);
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear servicios
    static async createEstate(estate) {
        //verificamos antes si existe antes de crear
        const {estates} = estate;
        const existing = await EstateRepository.findByEstates(estates);
        if (existing) return null;

        const estateID = await EstateRepository.create(estate);
        return {estateID, estate};
    }

    //actualizar usuarios
    static async updateEstate(estate) {
        if (!estate.id || isNaN(estate.id)) return null;
        //verificamos antes si existe antes de actualizar
        const existing = await EstateRepository.findById(estate.id);
        if (!existing) return null;

        const updated = await EstateRepository.update(estate);
        return updated ? estate : null;
    }

    //eliminar usuarios
    static async deleteService(id) {
        if (!id || isNaN(id)) return null;
        //verificamos antes si existe antes de actualizar
        const existing = await EstateRepository.findById(id);
        if (!existing) return null;

        return await EstateRepository.delete(id);
    }


}