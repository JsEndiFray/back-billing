import ClientsRepository from "../repository/clientsRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";

/**
 * Servicio de clientes con lógica de negocio compleja
 * Maneja relaciones empresa-administrador y validaciones
 */
export default class ClientsServices {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllClients() {
        return await ClientsRepository.getAll();
    }

    static async getAllForDropdownClients() {
        return await ClientsRepository.getAllForDropdown();
    }

    static async getCompanies() {
        const companies = await ClientsRepository.getCompanies();
        return companies || [];
    }

    static async getAutonomsWithCompanies() {
        return await ClientsRepository.getAutonomsWithCompanies();
    }

    static async getAdministratorsByCompany(companyId) {
        if (!companyId || isNaN(Number(companyId))) return [];
        return await ClientsRepository.getAdministratorsByCompany(companyId);
    }

    // ========================================
    // BÚSQUEDAS CON VALIDACIÓN Y SANITIZACIÓN
    // ========================================

    static async getByClientType(type_cliente) {
        if (!type_cliente) return [];
        return await ClientsRepository.findByType(type_cliente);
    }

    static async getCompany(company_name) {
        if (!company_name || typeof company_name !== 'string') return [];
        const companyNameNormalized = sanitizeString(company_name);
        if (!companyNameNormalized || companyNameNormalized.length === 0) return [];
        return await ClientsRepository.findByCompany(sanitizeString(companyNameNormalized));
    }

    static async getFullName(name, lastname) {
        if (!name && !lastname) return [];
        return await ClientsRepository.findByNameOrLastname(sanitizeString(name, lastname));
    }

    static async getByIdentification(identification) {
        if (!identification) return [];
        return await ClientsRepository.findByIdentification(sanitizeString(identification));
    }

    static async getClientById(id) {
        if (!id || isNaN(id)) return [];
        return await ClientsRepository.findById(id);
    }

    // ========================================
    // CREAR CON REGLAS DE NEGOCIO
    // ========================================

    static async createClient(data) {
        // Limpiar datos con transformaciones estándar
        const clientsData = {
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

        // REGLA: Autónomos con empresa deben tener relationship_type
        if (clientsData.type_client === 'autonomo' && clientsData.parent_company_id) {
            if (!clientsData.relationship_type) {
                clientsData.relationship_type = 'administrator'; // Por defecto
            }

            // Verificar que la empresa existe y es válida
            const company = await ClientsRepository.findById(clientsData.parent_company_id);
            if (!company.length || company[0].type_client !== 'empresa') {
                return [];
            }
        }

        // REGLA: Solo autónomos pueden tener empresa padre
        if (clientsData.type_client !== 'autonomo') {
            clientsData.parent_company_id = null;
            clientsData.relationship_type = null;
        }

        // Verificar identificación única
        const existing = await ClientsRepository.findByIdentification(clientsData.identification);
        if (existing.length > 0) return [];

        const created = await ClientsRepository.create(clientsData)
        return [{...clientsData, id: created[0].id}];
    }

    // ========================================
    // ACTUALIZAR CON VALIDACIONES
    // ========================================

    static async updateClient(id, data) {
        if (!id || isNaN(Number(id))) return [];

        // Limpiar datos (mismo proceso que create)
        const cleanClientsData = {
            id: Number(id),
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

        // Aplicar mismas reglas de negocio
        if ((cleanClientsData.type_client === 'autonomo' || cleanClientsData.type_client === 'particular') && cleanClientsData.parent_company_id) {
            if (!cleanClientsData.relationship_type) {
                cleanClientsData.relationship_type = 'ADMINISTRATOR';
            }
            const company = await ClientsRepository.findById(cleanClientsData.parent_company_id);
            if (!company.length > 0 || company[0].type_client !== 'empresa') {
                return [];
            }
        }

        // REGLA: Empresas no pueden ser administradoras
        if (cleanClientsData.type_client === 'empresa') {
            cleanClientsData.parent_company_id = null;
            cleanClientsData.relationship_type = null;
        }

        // Verificar que existe
        const existing = await ClientsRepository.findById(cleanClientsData.id);
        if (!existing.length > 0) return [];

        // Verificar identificación única (excepto este mismo cliente)
        if (cleanClientsData.identification) {
            const clientWithSameIdentification = await ClientsRepository.findByIdentification(cleanClientsData.identification);
            if (clientWithSameIdentification.length > 0 && clientWithSameIdentification[0].id !== Number(id)) {
                return [];
            }
        }

        const updated = await ClientsRepository.update(cleanClientsData);
        return updated.length > 0 ? [cleanClientsData] : [];
    }

    // ========================================
    // ELIMINAR CON VALIDACIONES DE INTEGRIDAD
    // ========================================

    static async deleteClient(id) {
        if (!id || isNaN(Number(id))) return [];

        const client = await ClientsRepository.findById(id);
        if (!client.length > 0) return [];

        // REGLA 1: No eliminar si tiene facturas
        const billsCount = await ClientsRepository.countBillsByClient(id);
        if (billsCount[0].count > 0) {
            return ['CLIENT_HAS_BILLS'];
        }

        // REGLA 2: No eliminar empresa si tiene administradores
        if (client[0].type_client === 'empresa') {
            const adminsCount = await ClientsRepository.countAdministratorsByCompany(id);
            if (adminsCount[0].count > 0) {
                return ['CLIENT_HAS_ADMINISTRATORS'];
            }
        }

        // REGLA 3: No eliminar administrador activo
        if (client[0].type_client === 'autonomo' && client[0].parent_company_id && client[0].relationship_type === 'administrator') {
            return ['CLIENT_IS_ADMINISTRATOR'];
        }

        const result = await ClientsRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }
}

/**
 * REGLAS DE NEGOCIO PRINCIPALES:
 * 1. Solo autónomos pueden tener empresa padre
 * 2. Autónomos con empresa son administradores por defecto
 * 3. Empresas no pueden eliminarse si tienen administradores
 * 4. Clientes no se eliminan si tienen facturas
 * 5. Identificaciones deben ser únicas
 */