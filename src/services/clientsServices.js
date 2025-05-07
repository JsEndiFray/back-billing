import ClientsRepository from "../repository/clientsRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

export default class ClientsServices {

    //obtener los datos de los clientes
    static async getAllClients() {
        return await ClientsRepository.getAll();
    }

    //MÉTODOS DE BÚSQUEDAS
    //búsqueda por tipo de cliente.
    static async getByClientType(type_cliente) {
        if (!type_cliente) return null;
        return await ClientsRepository.findByType(type_cliente);
    }

    //búsqueda por nombre de empresa.
    static async getCompany(company_name) {
        if (!company_name || typeof company_name !== 'string') return null;

        const companyNameNormalized = sanitizeString(company_name);
        if(!companyNameNormalized || companyNameNormalized.length === 0) return null;

        return await ClientsRepository.findByCompany(sanitizeString(companyNameNormalized));
    }

    //búsqueda por nombre y apellidos
    static async getFullName(name, lastname) {
        if (!name && !lastname) return null;
        return await ClientsRepository.findByNameOrLastname(sanitizeString(name, lastname));
    }

    //búsqueda por identificación
    static async getByIdentification(identification) {
        if (!identification) return null;
        return await ClientsRepository.findByIdentification(sanitizeString(identification));
    }

    //búsqueda por ID
    static async getById(id) {
        if (!id || isNaN(id)) return null;
        return await ClientsRepository.findById(id);
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear clientes
    static async createClient(data) {
        const {identification} = data;

        //verificamos si existe el cliente
        const existing = await ClientsRepository.findByIdentification(identification);
        if (existing) return null;

        const new_client = await ClientsRepository.create(data)
        return {id: new_client, ...data}
    }

    //actualizar clientes
    static async updateClient(id, data) {
        if (!id || isNaN(Number(id))) return null;

        // verificar si existe el cliente
        const existing = await ClientsRepository.findById(id);
        if (!existing) return null;

        // comprobar si el nuevo identification está en uso por otro cliente
        if (data.identification) {
            const clientWithSameIdentification = await ClientsRepository.findByIdentification(data.identification);

            // si existe otro cliente con el mismo identification y NO es este
            if (clientWithSameIdentification && clientWithSameIdentification.id !== Number(id)) {
                // devolver null para que el controlador devuelva error
                return null;
            }
        }

        // actualizar
        const updated = await ClientsRepository.update({id, ...data});
        return updated ? {id, ...data} : null;
    }

    //eliminar el cliente
    static async deleteClient(id) {
        if (!id || isNaN(Number(id))) return null;
        const result = await ClientsRepository.delete(id);
        return result > 0;
    }

}