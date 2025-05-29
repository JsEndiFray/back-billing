import ClientsRepository from "../repository/clientsRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

export default class ClientsServices {

    //obtener los datos de los clientes
    static async getAllClients() {
        return await ClientsRepository.getAll();
    }

    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdownClients() {
        return await ClientsRepository.getAllForDropdown();
    }

    // Obtener solo empresas para dropdown
    static async getCompanies() {
        const companies = await ClientsRepository.getCompanies();
        return companies || [];
    }

    //Obtener autónomos con información de empresa
    static async getAutonomsWithCompanies() {
        return await ClientsRepository.getAutonomsWithCompanies();
    }

    //Obtener administradores de una empresa
    static async getAdministratorsByCompany(companyId) {
        if (!companyId || isNaN(Number(companyId))) return [];
        return await ClientsRepository.getAdministratorsByCompany(companyId);
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
        if (!companyNameNormalized || companyNameNormalized.length === 0) return null;

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
        //Limpiar y transformar datos
        const clientstData = {
            type_client: data.type_client.trim(),
            name: data.name?.trim(),
            lastname: data.lastname?.trim(),
            company_name: data.company_name?.toUpperCase().trim(),
            identification: data.identification?.toUpperCase().trim(),
            phone: data.phone?.trim(),
            email: data.email?.toLowerCase().trim(),
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
            parent_company_id: data.parent_company_id && data.parent_company_id !== '' ? Number(data.parent_company_id) : null,
            relationship_type: data.relationship_type ? data.relationship_type.toUpperCase() : null
        };
        //Si es autónomo con empresa, debe tener relationship_type
        if (clientstData.type_client === 'autonomo' && clientstData.parent_company_id) {
            if (!clientstData.relationship_type) {
                clientstData.relationship_type = 'administrator'; // Por defecto
            }

            //Verificar que la empresa existe
            const company = await ClientsRepository.findById(clientstData.parent_company_id);
            if (!company || company.type_client !== 'empresa') {
                return null; // Empresa no válida
            }
        }
        //Si NO es autónomo, limpiar campos de relación
        if (clientstData.type_client !== 'autonomo') {
            clientstData.parent_company_id = null;
            clientstData.relationship_type = null;
        }
        //verificamos si existe el cliente
        const existing = await ClientsRepository.findByIdentification(clientstData.identification);
        if (existing) return null;

        const new_client = await ClientsRepository.create(clientstData)
        return new_client;
    }

    //actualizar clientes
    static async updateClient(id, data) {
        if (!id || isNaN(Number(id))) return null;
        //Limpiar y transformar datos
        const cleanClientsData = {
            id: id,
            type_client: data.type_client?.trim(),
            name: data.name?.trim(),
            lastname: data.lastname?.trim(),
            company_name: data.company_name?.toUpperCase().trim(),
            identification: data.identification?.toUpperCase().trim(),
            phone: data.phone?.trim(),
            email: data.email?.toLowerCase().trim(),
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
            parent_company_id: data.parent_company_id && data.parent_company_id !== '' ? Number(data.parent_company_id) : null,
            relationship_type: data.relationship_type ? data.relationship_type.toUpperCase() : null
        }

        //Mismas reglas que en create
        if (cleanClientsData.type_client === 'autonomo' && cleanClientsData.parent_company_id) {
            if (!cleanClientsData.relationship_type) {
                cleanClientsData.relationship_type = 'administrator';
            }

            const company = await ClientsRepository.findById(cleanClientsData.parent_company_id);
            if (!company || company.type_client !== 'empresa') {
                return null;
            }
        }

        if (cleanClientsData.type_client !== 'autonomo') {
            cleanClientsData.parent_company_id = null;
            cleanClientsData.relationship_type = null;
        }

        // verificar si existe el cliente
        const existing = await ClientsRepository.findById(cleanClientsData.id);
        if (!existing) return null;

        // comprobar si el nuevo identification está en uso por otro cliente
        if (cleanClientsData.identification) {
            const clientWithSameIdentification = await ClientsRepository.findByIdentification(cleanClientsData.identification);

            // si existe otro cliente con el mismo identification y NO es este
            if (clientWithSameIdentification && clientWithSameIdentification.id !== Number(id)) {
                // devolver null para que el controlador devuelva error
                return null;
            }
        }
        // actualizar
        const updated = await ClientsRepository.update(cleanClientsData);
        return updated ? cleanClientsData : null;
    }

    //eliminar el cliente
    static async deleteClient(id) {
        if (!id || isNaN(Number(id))) return null;

        // Obtener el cliente
        const client = await ClientsRepository.findById(id);
        if (!client) return null;

        // 1. Verificar facturas
        const billsCount = await ClientsRepository.countBillsByClient(id);
        if (billsCount > 0) {
            return 'CLIENT_HAS_BILLS';
        }

        // 2. Si es empresa, verificar administradores
        if (client.type_client === 'empresa') {
            const adminsCount = await ClientsRepository.countAdministratorsByCompany(id);
            if (adminsCount > 0) {
                return 'CLIENT_HAS_ADMINISTRATORS';
            }
        }

        // 3. Si es autónomo administrador
        if (client.type_client === 'autonomo' && client.parent_company_id && client.relationship_type === 'administrator') {
            return 'CLIENT_IS_ADMINISTRATOR';
        }

        // Si llegamos aquí, eliminar
        const result = await ClientsRepository.delete(id);
        return result > 0; // true o false
    }


}