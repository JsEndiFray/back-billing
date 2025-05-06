import EstateService from '../services/estatesServices.js';
import {ErrorMessage} from "../helpers/msgError.js";
import {validationResult} from "express-validator";


export default class EstateController {

    //obtener los inmuebles
    static async getAllEstate(req, res) {
        try {
            const estate = await EstateService.getAllEstate();
            if (!estate || estate.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, estate})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.SEARCH_ERROR});
        }
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda de inmueble con el catastro.
    static async getByCadastralReference(req, res) {
        try {
            const {cadastral} = req.params;
            if (!cadastral || typeof cadastral !== 'string' || cadastral.trim() === '') {
                return res.status(404).json({msg: ErrorMessage.ESTATES.REFERENCE_CADASTRAL});
            }
            const result = await EstateService.getByCadastralReference(cadastral);
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, result})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.SEARCH_ERROR});
        }
    }

    //búsqueda de inmuebles con el ID
    static async getById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(id)) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const result = await EstateService.getById(id);
            if (!result) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, result})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.SEARCH_ERROR});
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE

    //crear inmuebles
    static async createEstate(req, res) {
        try {
            const {cadastral_reference} = req.body;
            const existing = await EstateService.getByCadastralReference(cadastral_reference);
            if (existing && existing.length > 0) {
                return res.status(400).json({msg: ErrorMessage.ESTATES.DUPLICATE});
            }

            const created = await EstateService.createEstate(req.body);
            if (!created) {
                return res.status(500).json({msg: ErrorMessage.GLOBAL.ERROR_CREATE});
            }

            return res.status(201).json({
                msg: ErrorMessage.GLOBAL.CREATE,
                estate: created
            });

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //Actualizar inmuebles
    static async updateEstate(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const existing = await EstateService.getById(id);
            if (!existing) {
                return res.status(400).json({msg: ErrorMessage.ESTATES.NOT_FOUND})
            }
            const updated = await EstateService.updateEstate({id: Number(id), ...req.body});
            if (!updated) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.ERROR_UPDATE});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.UPDATE, estate: updated})


        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //eliminar inmueble
    static async deleteEstate(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const existing = await EstateService.getById(id);
            if (!existing) {
                return res.status(404).json({msg: ErrorMessage.ESTATES.NOT_FOUND});
            }

            const deleted = await EstateService.deleteService(id);
            if (!deleted) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.ERROR_DELETE});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DELETE});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }


}