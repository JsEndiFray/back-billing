import EstateService from '../services/estatesServices.js';
import { ErrorCodes, sendError, sendSuccess, ErrorMessages } from "../errors/index.js";

export default class EstateController {

    //obtener los inmuebles
    static async getAllEstate(req, res) {
        try {
            const estate = await EstateService.getAllEstate();
            if (!estate || estate.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { estate });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SEARCH_ERROR);
        }
    }

    //obtener todos los propietarios con su ID y su nombre
    static async getAllForDropdownEstates(req, res) {
        try {
            const estates = await EstateService.getAllForDropdownEstates();
            if (!estates || estates.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { Estates: estates });
        } catch (error) {
            console.log(error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda de inmueble con el catastro.
    static async getByCadastralReference(req, res) {
        try {
            const { cadastral } = req.params;
            if (!cadastral || typeof cadastral !== 'string' || cadastral.trim() === '') {
                return sendError(res, ErrorCodes.ESTATE_REFERENCE_REQUIRED);
            }
            const result = await EstateService.getByCadastralReference(cadastral);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { result });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SEARCH_ERROR);
        }
    }

    //búsqueda de inmuebles con el ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const result = await EstateService.getById(id);
            if (!result) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { result });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SEARCH_ERROR);
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear inmuebles
    static async createEstate(req, res) {
        try {
            const { cadastral_reference } = req.body;
            const existing = await EstateService.getByCadastralReference(cadastral_reference);
            if (existing && existing.length > 0) {
                return sendError(res, ErrorCodes.ESTATE_DUPLICATE);
            }

            const created = await EstateService.createEstate(req.body);
            if (!created) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_CREATE);
            }

            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_CREATE], {
                estate: created
            }, 201);

        } catch (error) {
            console.log(error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //Actualizar inmuebles
    static async updateEstate(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const existing = await EstateService.getById(id);
            if (!existing) {
                return sendError(res, ErrorCodes.ESTATE_NOT_FOUND);
            }
            const updated = await EstateService.updateEstate({ id: Number(id), ...req.body });
            if (!updated) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_UPDATE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_UPDATE], { estate: updated });

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //eliminar inmueble
    static async deleteEstate(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const existing = await EstateService.getById(id);
            if (!existing) {
                return sendError(res, ErrorCodes.ESTATE_NOT_FOUND);
            }

            const deleted = await EstateService.deleteService(id);
            if (!deleted) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_DELETE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DELETE]);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
}