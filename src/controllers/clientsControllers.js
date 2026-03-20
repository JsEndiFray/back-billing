import ClientsServices from "../services/clientsServices.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";

/**
 * Controlador de clientes - Capa HTTP que maneja requests/responses
 * Convierte resultados del servicio en respuestas HTTP apropiadas
 */
export default class ClientsControllers {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllClients(req, res, next) {
        try {
            const clients = await ClientsServices.getAllClients()
            if (!clients || clients.length === 0) {
                return res.status(404).json("No se encontraron clientes");
            }
            return res.status(200).json(clients);
        } catch (error) {
            next(error);
        }
    };

    static async getAllForDropdownClients(req, res, next) {
        try {
            const clients = await ClientsServices.getAllForDropdownClients();
            if (!clients || clients.length === 0) {
                return res.status(404).json("No se encontraron clientes");
            }
            return res.status(200).json(clients);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene empresas para dropdown
     * Nota: Retorna array vacío en lugar de 404 para mejor UX
     */
    static async getCompanies(req, res, next) {
        try {
            const companies = await ClientsServices.getCompanies();
            if (!companies || companies.length === 0) {
                return res.status(200).json([]); // Array vacío, no error
            }
            return res.status(200).json(companies);
        } catch (error) {
            next(error);
        }
    }

    static async getAutonomsWithCompanies(req, res, next) {
        try {
            const autonoms = await ClientsServices.getAutonomsWithCompanies();
            if (!autonoms || autonoms.length === 0) {
                return res.status(404).json("No se encontraron autónomos");
            }
            return res.status(200).json(autonoms);
        } catch (error) {
            next(error);
        }
    }

    static async getAdministratorsByCompany(req, res, next) {
        try {
            const {companyId} = req.params;
            if (!companyId || isNaN(Number(companyId))) {
                return res.status(400).json("ID de empresa inválido");
            }

            const administrators = await ClientsServices.getAdministratorsByCompany(companyId);
            if (!administrators || administrators.length === 0) {
                return res.status(200).json([]); // Array vacío para dropdown
            }
            return res.status(200).json(administrators);
        } catch (error) {
            next(error);
        }
    }

    // ========================================
    // BÚSQUEDAS CON VALIDACIÓN DE PARÁMETROS
    // ========================================

    /**
     * Busca por tipo de cliente con validación de tipos permitidos
     */
    static async getByClientType(req, res, next) {
        try {
            const {clientType} = req.params;
            const clientTypeNormalized = sanitizeString(clientType);

            const allowedTypes = ['particular', 'autonomo', 'empresa'];
            if (!allowedTypes.includes(clientTypeNormalized)) {
                return res.status(400).json("Tipo de cliente inválido");
            }

            const clientsType = await ClientsServices.getByClientType(clientTypeNormalized);
            if (!clientsType || clientsType.length === 0) {
                return res.status(404).json("No se encontraron clientes de este tipo");
            }
            return res.status(200).json(clientsType);
        } catch (error) {
            next(error);
        }
    }

    static async getCompany(req, res, next) {
        try {
            const {company_name} = req.params;
            if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
                return res.status(400).json("Nombre de empresa requerido");
            }
            const result = await ClientsServices.getCompany(company_name);
            if (!result || result.length === 0) {
                return res.status(404).json("Empresa no encontrada");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Búsqueda por nombre/apellido usando query parameters
     * Permite buscar por uno o ambos campos
     */
    static async getFullName(req, res, next) {
        try {
            const {name, lastname} = req.query;
            if (!name && !lastname) {
                return res.status(400).json("Nombre o apellido requerido");
            }

            const nameSanitized = name ? sanitizeString(name) : null;
            const lastnameSanitized = lastname ? sanitizeString(lastname) : null;

            const result = await ClientsServices.getFullName(nameSanitized, lastnameSanitized);
            if (!result || result.length === 0) {
                return res.status(404).json("Cliente no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getByIdentification(req, res, next) {
        try {
            const {identification} = req.params;
            const identificationNormalized = sanitizeString(identification);
            if (!identificationNormalized || identificationNormalized.length === 0) {
                return res.status(400).json("Identificación requerida");
            }
            const result = await ClientsServices.getByIdentification(identificationNormalized);
            if (!result || result.length === 0) {
                return res.status(404).json("Cliente no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await ClientsServices.getClientById(id);
            if (!result) {
                return res.status(404).json("Cliente no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ========================================
    // CRUD CON MANEJO DE CÓDIGOS HTTP
    // ========================================

    static async createClient(req, res, next) {
        try {
            const {type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type} = req.body;
            const created = await ClientsServices.createClient({type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type});
            if (!created || created.length === 0) {
                return res.status(409).json("Cliente duplicado");
            }
            return res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    }

    static async updateClient(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const {type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type} = req.body;
            const updated = await ClientsServices.updateClient(id, {type_client, name, lastname, company_name, identification, phone, email, address, postal_code, location, province, country, parent_company_id, relationship_type});
            if (!updated || updated.length === 0) {
                return res.status(409).json("Cliente duplicado");
            }
            return res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar cliente con manejo de múltiples tipos de error del servicio
     * El servicio retorna strings específicos para diferentes escenarios
     */
    static async deleteClient(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await ClientsServices.deleteClient(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Cliente no encontrado");
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
/**
 * CÓDIGOS HTTP UTILIZADOS:
 * - 200: OK (consultas exitosas)
 * - 201: Created (creación exitosa)
 * - 204: No Content (eliminación exitosa)
 * - 400: Bad Request (parámetros inválidos)
 * - 404: Not Found (recurso no encontrado)
 * - 409: Conflict (duplicados, integridad referencial)
 * - 500: Internal Server Error (errores técnicos)
 */