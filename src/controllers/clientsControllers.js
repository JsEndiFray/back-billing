import ClientsServices from "../services/clientsServices.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

export default class ClientsControllers {

    //obtener los datos de los clientes
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

    //obtener todos los propietarios con su ID y su nombre
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

    //Obtener solo empresas para dropdown
    static async getCompanies(req, res) {
        try {
            const companies = await ClientsServices.getCompanies();
            if (!companies || companies.length === 0) {
                //Para empresas, devolver array vacío en lugar de error
                return res.status(200).json([]);
            }
            return res.status(200).json(companies);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    //Obtener autónomos con información de empresa
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

    //Obtener administradores de una empresa específica
    static async getAdministratorsByCompany(req, res) {
        try {
            const {companyId} = req.params;
            if (!companyId || isNaN(Number(companyId))) {
                return res.status(400).json("ID de empresa inválido");
            }

            const administrators = await ClientsServices.getAdministratorsByCompany(companyId);
            if (!administrators || administrators.length === 0) {
                return res.status(200).json([]);
            }
            return res.status(200).json(administrators);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
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

    //búsqueda por nombre de empresa.
    static async getCompany(req, res) {
        try {
            //Obtienes el parámetro de la ruta (:company_name).
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

    //búsqueda por nombre y apellidos
    static async getFullName(req, res) {
        try {
            const {name, lastname} = req.query;
            if (!name && !lastname) {
                return res.status(400).json("Nombre o apellido requerido");
            }
            // Sanitizar individualmente
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

    //búsqueda por identificación
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

    //búsqueda por ID
    static async getById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await ClientsServices.getById(id);
            if (!result) {
                return res.status(404).json("Cliente no encontrado");
            }
            return res.status(200).json(result);

        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    //crear clientes
    static async createClient(req, res) {
        try {
            const created = await ClientsServices.createClient(req.body);
            if (!created) {
                return res.status(409).json("Cliente duplicado");
            }
            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    //actualizar clientes
    static async updateClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const existing = await ClientsServices.getById(id);
            if (!existing) {
                return res.status(404).json("Cliente no encontrado");
            }
            const updated = await ClientsServices.updateClient(id, req.body);
            if (!updated) {
                return res.status(409).json("Cliente duplicado");
            }

            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    //eliminar el cliente
    static async deleteClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const result = await ClientsServices.deleteClient(id);

            // Cliente no encontrado
            if (result === null) {
                return res.status(404).json("Cliente no encontrado");
            }

            // Errores específicos de validación (strings)
            if (result === 'CLIENT_HAS_BILLS') {
                return res.status(409).json("El cliente tiene facturas asociadas");
            }
            if (result === 'CLIENT_HAS_ADMINISTRATORS') {
                return res.status(409).json("La empresa tiene administradores asociados");
            }
            if (result === 'CLIENT_IS_ADMINISTRATOR') {
                return res.status(409).json("El cliente es administrador de una empresa");
            }

            // No se pudo eliminar por motivo técnico
            if (result === false) {
                return res.status(500).json("Error al eliminar cliente");
            }

            // Éxito (result === true) - Respuesta sin contenido
            return res.status(204).send();

        } catch (error) {
            console.log(error);
            return res.status(500).json("Error interno del servidor");
        }
    }
}