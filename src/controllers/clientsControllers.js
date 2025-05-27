import ClientsServices from "../services/clientsServices.js";
import {ErrorCodes, sendError, sendSuccess, ErrorMessages} from "../errors/index.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

export default class ClientsControllers {

    //obtener los datos de los clientes
    static async getAllClients(req, res) {
        try {
            const clients = await ClientsServices.getAllClients()
            if (!clients || clients.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], clients);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    };

    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdownClients(req, res) {
        try {
            const clients = await ClientsServices.getAllForDropdownClients();
            if (!clients || clients.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], clients);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //Obtener solo empresas para dropdown
    static async getCompanies(req, res) {
        try {
            const companies = await ClientsServices.getCompanies();
            if (!companies || companies.length === 0) {
                //Para empresas, devolver array vacío en lugar de error
                return sendSuccess(res, ErrorMessages[ErrorCodes.CLIENT_COMPANIES_NOT_FOUND], []);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], companies);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //Obtener autónomos con información de empresa
    static async getAutonomsWithCompanies(req, res) {
        try {
            const autonoms = await ClientsServices.getAutonomsWithCompanies();
            if (!autonoms || autonoms.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], autonoms);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //Obtener administradores de una empresa específica
    static async getAdministratorsByCompany(req, res) {
        try {
            const {companyId} = req.params;
            if (!companyId || isNaN(Number(companyId))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }

            const administrators = await ClientsServices.getAdministratorsByCompany(companyId);
            if (!administrators || administrators.length === 0) {
                return sendSuccess(res, ErrorMessages[ErrorCodes.CLIENT_NOT_ADMIN], []);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], administrators);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }


    //búsqueda por tipo de cliente.
    static async getByClientType(req, res) {
        try {
            //Obtienes el parámetro de la ruta (:clientType).
            const {clientType} = req.params;
            //normalizamos para los espacios o mayúsculas y minúsculas
            const clientTypeNormalized = sanitizeString(clientType);
            //tipos permitidos
            const allowedTypes = ['particular', 'autonomo', 'empresa'];
            if (!allowedTypes.includes(clientTypeNormalized)) {
                return sendError(res, ErrorCodes.CLIENT_TYPE);
            }

            const clientsType = await ClientsServices.getByClientType(clientTypeNormalized);
            if (!clientsType || clientsType.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], clientsType);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //búsqueda por nombre de empresa.
    static async getCompany(req, res) {
        try {
            //Obtienes el parámetro de la ruta (:company_name).
            const {company_name} = req.params;
            if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
                return sendError(res, ErrorCodes.CLIENT_NAME_REQUIRED);
            }
            const result = await ClientsServices.getCompany(company_name);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], result);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //búsqueda por nombre y apellidos
    static async getFullName(req, res) {
        try {
            const {name, lastname} = req.query;
            if (!name && !lastname) {
                return sendError(res, ErrorCodes.CLIENT_NAME_LASTNAME_REQUIRED);
            }
            // Sanitizar individualmente
            const nameSanitized = name ? sanitizeString(name) : null;
            const lastnameSanitized = lastname ? sanitizeString(lastname) : null;

            const result = await ClientsServices.getFullName(nameSanitized, lastnameSanitized);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], result);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //búsqueda por identificación
    static async getByIdentification(req, res) {
        try {
            const {identification} = req.params;
            const identificationNormalized = sanitizeString(identification);
            if (!identificationNormalized || identificationNormalized.length === 0) {
                return sendError(res, ErrorCodes.CLIENT_ID_REQUIRED);
            }
            const result = await ClientsServices.getByIdentification(identificationNormalized);

            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], result);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //búsqueda por ID
    static async getById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const result = await ClientsServices.getById(id);
            if (!result) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], result);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    //crear clientes
    static async createClient(req, res) {
        try {
            const created = await ClientsServices.createClient(req.body);
            if (!created) {
                return sendError(res, ErrorCodes.CLIENT_DUPLICATE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_CREATE], created);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
    //actualizar clientes
    static async updateClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const existing = await ClientsServices.getById(id);
            if (!existing) {
                return sendError(res, ErrorCodes.CLIENT_NOT_FOUND);
            }
            const updated = await ClientsServices.updateClient(id, req.body);
            if (!updated) {
                return sendError(res, ErrorCodes.CLIENT_DUPLICATE);
            }

            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_UPDATE], updated);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //eliminar el cliente
    static async deleteClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const deleted = await ClientsServices.deleteClient(id);
            if (!deleted) {
                return sendError(res, ErrorCodes.CLIENT_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DELETE]);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
}