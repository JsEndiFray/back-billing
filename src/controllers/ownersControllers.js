import OwnersServices from "../services/ownersServices.js";
import { ErrorCodes, sendError, sendSuccess, ErrorMessages } from "../errors/index.js";

export default class OwnersControllers {

    //obtener los owners
    static async getAllOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllOwners();
            if (!owners || owners.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { owners: owners });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdownOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllForDropdownOwners();
            if (!owners || owners.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { Owners: owners });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por nombre, apellido o nif
    static async getOwner(req, res) {
        try {
            const { name, lastname, nif } = req.query;
            const owner = await OwnersServices.getOwner(name, lastname, nif);
            if (!owner) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { owner: owner });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Obtener un usuario por ID
    static async getOwnerId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const owner = await OwnersServices.getOwnerId(id);
            if (!owner) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { owner: owner });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    //crear usuario
    static async createOwner(req, res) {
        try {
            const created = await OwnersServices.createOwner(req.body);
            if (created?.duplicated) {
                return sendError(res, ErrorCodes.OWNER_DUPLICATE);
            }
            if (!created) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_CREATE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_CREATE], {
                owner: created
            }, 201);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //actualizar usuarios
    static async updateOwner(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const existing = await OwnersServices.getOwnerId(id);
            if (!existing) {
                return sendError(res, ErrorCodes.OWNER_NOT_FOUND);
            }
            const updated = await OwnersServices.updateOwner(id, req.body);
            if (!updated) {
                return sendError(res, ErrorCodes.OWNER_DUPLICATE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_UPDATE], { owner: updated });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
    //eliminar owners
    static async deleteOwner(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const deleted = await OwnersServices.deleteOwner(id);
            if (!deleted) {
                return sendError(res, ErrorCodes.OWNER_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DELETE]);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
}