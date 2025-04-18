import EstateService from '../services/estateServices.js';
import {ErrorMessage} from "../utils/msgError.js";


export default class EstateController {

    //obtener los inmuebles
    static async getAllEstate(req, res) {
        try {
            const estate = await EstateService.getAllEstate();
            if (!estate || estate.length === 0) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.NO_DATA})
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
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, result})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.SEARCH_ERROR});
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE


}