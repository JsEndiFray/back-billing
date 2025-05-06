import OwnersRepository from "../repository/ownersRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

export default class OwnersServices {

    //obtener los datos del usuario
    static async getAllOwners() {
        return await OwnersRepository.getAll();
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por nombre, apellido o nif
    static async getOwner(name, lastname, nif) {
        if (!name && !lastname && !nif) return null;

        // Búsqueda secuencial por prioridad
        if (name) {
            const owner = await OwnersRepository.findByName(sanitizeString(name));
            if (owner.length) return owner;
        }
        if (lastname) {
            const owner = await OwnersRepository.findByLastname(sanitizeString(lastname));
            if (owner.length) return owner;
        }
        if (nif) {
            return await OwnersRepository.findByNif(sanitizeString(nif));
        }
        return null;
    }


    // Obtener un usuario por ID
    static async getOwnerId(id) {
        if (!id && isNaN(Number(id))) return null;
        return await OwnersRepository.findById(id);
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear usuario
    static async createOwner(owner) {
        const {nif} = owner;

        const existing = await OwnersRepository.findByNif(nif);
        if (existing) return {duplicated: true};

        const ownerID = await OwnersRepository.create(owner);
        if (!ownerID) return null;

        //Retornar resultado
        return {ownerID, owner};
    }

    //actualizar usuarios
    static async updateOwner(id, data) {
        if (!id || isNaN(Number(id))) return null;

        // verificar si existe
        const existing = await OwnersRepository.findById(id);
        if (!existing) return null;

        // validar que la nueva identificación no la tenga otro owner
        if (data.nif) {
            const ownerWithSameIdentification = await OwnersRepository.findByNif(data.nif);
            if (ownerWithSameIdentification && ownerWithSameIdentification.id !== Number(id)) {
                // la identificación ya está en uso por otro owner
                return null;
            }
        }
        // actualizar
        const updated = await OwnersRepository.update({id, ...data});
        return updated ? {id, ...data} : null;
    }

    //eliminar owners
    static async deleteOwner(id) {
        if (!id || isNaN(Number(id))) return null;
        //verificamos antes si existe antes de actualizar
        const existing = await OwnersRepository.findById(id);
        if (!existing) return null;

        const result = await OwnersRepository.delete(id);
        return result > 0;
    }


}