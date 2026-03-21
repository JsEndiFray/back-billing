import ClientsServices from "../services/clientsServices.js";
import { sanitizeString } from "../shared/helpers/stringHelpers.js";
import { createClientDTO, updateClientDTO } from "../dto/client.dto.js";

export default class ClientsControllers {

    static async getAllClients(req, res, next) {
        try {
            const clients = await ClientsServices.getAllClients();
            if (!clients || clients.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron clientes" });
            }
            return res.status(200).json({ success: true, data: clients });
        } catch (error) {
            next(error);
        }
    }

    static async getAllForDropdownClients(req, res, next) {
        try {
            const clients = await ClientsServices.getAllForDropdownClients();
            if (!clients || clients.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron clientes" });
            }
            return res.status(200).json({ success: true, data: clients });
        } catch (error) {
            next(error);
        }
    }

    static async getCompanies(req, res, next) {
        try {
            const companies = await ClientsServices.getCompanies();
            return res.status(200).json({ success: true, data: companies || [] });
        } catch (error) {
            next(error);
        }
    }

    static async getAutonomsWithCompanies(req, res, next) {
        try {
            const autonoms = await ClientsServices.getAutonomsWithCompanies();
            if (!autonoms || autonoms.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron autónomos" });
            }
            return res.status(200).json({ success: true, data: autonoms });
        } catch (error) {
            next(error);
        }
    }

    static async getAdministratorsByCompany(req, res, next) {
        try {
            const { companyId } = req.params;
            if (!companyId || isNaN(Number(companyId))) {
                return res.status(400).json({ success: false, message: "ID de empresa inválido" });
            }
            const administrators = await ClientsServices.getAdministratorsByCompany(companyId);
            return res.status(200).json({ success: true, data: administrators || [] });
        } catch (error) {
            next(error);
        }
    }

    static async getByClientType(req, res, next) {
        try {
            const { clientType } = req.params;
            const clientTypeNormalized = sanitizeString(clientType);
            const allowedTypes = ['particular', 'autonomo', 'empresa'];
            if (!allowedTypes.includes(clientTypeNormalized)) {
                return res.status(400).json({ success: false, message: "Tipo de cliente inválido" });
            }
            const clientsType = await ClientsServices.getByClientType(clientTypeNormalized);
            if (!clientsType || clientsType.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron clientes de este tipo" });
            }
            return res.status(200).json({ success: true, data: clientsType });
        } catch (error) {
            next(error);
        }
    }

    static async getCompany(req, res, next) {
        try {
            const { company_name } = req.params;
            if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
                return res.status(400).json({ success: false, message: "Nombre de empresa requerido" });
            }
            const result = await ClientsServices.getCompany(company_name);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Empresa no encontrada" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getFullName(req, res, next) {
        try {
            const { name, lastname } = req.query;
            if (!name && !lastname) {
                return res.status(400).json({ success: false, message: "Nombre o apellido requerido" });
            }
            const nameSanitized = name ? sanitizeString(name) : null;
            const lastnameSanitized = lastname ? sanitizeString(lastname) : null;
            const result = await ClientsServices.getFullName(nameSanitized, lastnameSanitized);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Cliente no encontrado" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getByIdentification(req, res, next) {
        try {
            const { identification } = req.params;
            const identificationNormalized = sanitizeString(identification);
            if (!identificationNormalized || identificationNormalized.length === 0) {
                return res.status(400).json({ success: false, message: "Identificación requerida" });
            }
            const result = await ClientsServices.getByIdentification(identificationNormalized);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Cliente no encontrado" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await ClientsServices.getClientById(id);
            if (!result) {
                return res.status(404).json({ success: false, message: "Cliente no encontrado" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async createClient(req, res, next) {
        try {
            const dto = createClientDTO(req.body);
            const created = await ClientsServices.createClient(dto);
            if (!created || created.length === 0) {
                return res.status(409).json({ success: false, message: "Cliente duplicado" });
            }
            return res.status(201).json({ success: true, data: created });
        } catch (error) {
            next(error);
        }
    }

    static async updateClient(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const dto = updateClientDTO(req.body);
            const updated = await ClientsServices.updateClient(id, dto);
            if (!updated || updated.length === 0) {
                return res.status(409).json({ success: false, message: "Cliente duplicado" });
            }
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async deleteClient(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await ClientsServices.deleteClient(id);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Cliente no encontrado" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
