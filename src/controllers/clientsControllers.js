import ClientsServices from "../services/clientsServices.js";
import {ErrorMessage} from "../utils/msgError.js";
import {sanitizeString} from "../utils/stringHelpers.js";
import {validationResult} from "express-validator";

export default class ClientsControllers {


    //obtener los datos de los clientes
    static async getAllClients(req, res) {
        try {
            const clients = await ClientsServices.getAllClients()
            if (!clients || clients.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, clients})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    };

    //búsqueda por tipo de cliente.
    static async getByClientType(req, res) {
        try {
            //Obtienes el parámetro de la ruta (:clientType).
            const {clientType} = req.params;
            //normalizamos para los espacios o mayúsculas y minúsculas
            const clientTypeNormalized = sanitizeString(clientType);
            //tipos permitidos
            const allowedTypes = ['particular', 'autónomo', 'empresa'];
            if (!allowedTypes.includes(clientTypeNormalized)) {
                return res.status(400).json({msg: ErrorMessage.CLIENTS.TYPE});
            }

            const clientsType = await ClientsServices.getByClientType(clientTypeNormalized);
            if (!clientsType || clientsType.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, clientes: clientsType})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por nombre de empresa.
    static async getCompany(req, res) {
        try {
            //Obtienes el parámetro de la ruta (:company_name).
            const {company_name} = req.params;
            if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
                return res.status(404).json({msg: ErrorMessage.CLIENTS.NAME_REQUIRED});
            }
            const result = await ClientsServices.getCompany(company_name);
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({
                msg: ErrorMessage.GLOBAL.DATA,
                clientes: result
            })
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por nombre y apellidos
    static async getFullName(req, res) {
        try {
            const {name, lastname} = req.query;
            if (!name && !lastname) {
                return res.status(404).json({msg: ErrorMessage.CLIENTS.NAME_LASTNAME_REQUIRED});
            }
            // Sanitizar individualmente
            const nameSanitized = name ? sanitizeString(name) : null;
            const lastnameSanitized = lastname ? sanitizeString(lastname) : null;

            const result = await ClientsServices.getFullName(nameSanitized, lastnameSanitized);
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({
                msg: ErrorMessage.GLOBAL.DATA,
                clientes: result
            });

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por identificación
    static async getByIdentification(req, res) {
        try {
            const {identification} = req.params;
            const identificationNormalized = sanitizeString(identification);
            if (!identificationNormalized || identificationNormalized.length === 0) {
                return res.status(404).json({msg: ErrorMessage.CLIENTS.ID_REQUIRED});
            }
            const result = await ClientsServices.getByIdentification(identificationNormalized);

            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({
                msg: ErrorMessage.GLOBAL.DATA,
                clientes: result
            });

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por ID
    static async getById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const result = await ClientsServices.getById(id);
            if (!result) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({
                msg: ErrorMessage.GLOBAL.DATA,
                clientes: result
            });

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    //crear clientes
    static async createClient(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.debug("Validation errors:", errors.array());
                return res.status(400).json({
                    msg: ErrorMessage.GLOBAL.ERROR_VALIDATE,
                    errors: errors.array()
                })
            }
            const created = await ClientsServices.createClient(req.body);
            if (!created) {
                return res.status(400).json({msg: ErrorMessage.CLIENTS.DUPLICATE})
            }
            return res.status(201).json({msg: ErrorMessage.GLOBAL.CREATE})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //actualizar clientes
    static async updateClient(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.debug("Validation errors:", errors.array());
                return res.status(400).json({
                    msg: ErrorMessage.GLOBAL.ERROR_VALIDATE,
                    errors: errors.array()
                });
            }
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const existing = await ClientsServices.getById(id);
            if (!existing) {
                return res.status(404).json({msg: ErrorMessage.CLIENTS.NOT_FOUND})
            }
            const updated = await ClientsServices.updateClient(id, req.body);
            if (!updated) {
                return res.status(400).json({msg: ErrorMessage.CLIENTS.DUPLICATE});
            }

            return res.status(200).json({msg: ErrorMessage.GLOBAL.UPDATE, client: updated});
        } catch (error) {
            console.error(error);
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //eliminar el cliente
    static async deleteClient(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const deleted = await ClientsServices.deleteClient(id);
            if (!deleted) {
                return res.status(404).json({msg: ErrorMessage.CLIENTS.NOT_FOUND})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DELETE})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }


}