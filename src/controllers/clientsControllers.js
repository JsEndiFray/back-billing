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

    static async getAllClients(req, res) {
        try {
            const clients = await ClientsServices.getAllClients()
            if (!clients || clients.length === 0) {
                return res.status(404).json("No se encontraron clientes");
            }
            return res.status(200).json(clients);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    };

    static async getAllForDropdownClients(req, res) {
        try {
            const clients = await ClientsServices.getAllForDropdownClients();
            if (!clients || clients.length === 0) {
                return res.status(404).json("No se encontraron clientes");
            }
            return res.status(200).json(clients);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene empresas para dropdown
     * Nota: Retorna array vacío en lugar de 404 para mejor UX
     */
    static async getCompanies(req, res) {
        try {
            const companies = await ClientsServices.getCompanies();
            if (!companies || companies.length === 0) {
                return res.status(200).json([]); // Array vacío, no error
            }
            return res.status(200).json(companies);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getAutonomsWithCompanies(req, res) {
        try {
            const autonoms = await ClientsServices.getAutonomsWithCompanies();
            if (!autonoms || autonoms.length === 0) {
                return res.status(404).json("No se encontraron autónomos");
            }
            return res.status(200).json(autonoms);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getAdministratorsByCompany(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // BÚSQUEDAS CON VALIDACIÓN DE PARÁMETROS
    // ========================================

    /**
     * Busca por tipo de cliente con validación de tipos permitidos
     */
    static async getByClientType(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getCompany(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Búsqueda por nombre/apellido usando query parameters
     * Permite buscar por uno o ambos campos
     */
    static async getFullName(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getByIdentification(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getById(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // CRUD CON MANEJO DE CÓDIGOS HTTP
    // ========================================

    static async createClient(req, res) {
        try {
            const created = await ClientsServices.createClient(req.body);
            if (!created || created.length === 0) {
                return res.status(409).json("Cliente duplicado");
            }
            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async updateClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const existing = await ClientsServices.getClientById(id);
            if (!existing || existing.length === 0) {
                return res.status(404).json("Cliente no encontrado");
            }

            const updated = await ClientsServices.updateClient(id, req.body);
            if (!updated || updated.length === 0) {
                console.log(updated)
                return res.status(409).json("Cliente duplicado");
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Eliminar cliente con manejo de múltiples tipos de error del servicio
     * El servicio retorna strings específicos para diferentes escenarios
     */
    static async deleteClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const result = await ClientsServices.deleteClient(id);

            // Mapeo de respuestas del servicio a códigos HTTP
            if (!result || result.length === 0) {
                return res.status(404).json("Cliente no encontrado");
            }

            // Errores de integridad referencial
            if (Array.isArray(result) && result[0] === 'CLIENT_HAS_BILLS') {
                return res.status(409).json("El cliente tiene facturas asociadas");
            }
            if (Array.isArray(result) && result[0] === 'CLIENT_HAS_ADMINISTRATORS') {
                return res.status(409).json("La empresa tiene administradores asociados");
            }
            if (Array.isArray(result) && result[0] === 'CLIENT_IS_ADMINISTRATOR') {
                return res.status(409).json("El cliente es administrador de una empresa");
            }
            // Éxito - Sin contenido
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
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