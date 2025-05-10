import EstateOwnersService from "../services/estatesOwnersServices.js";
import { ErrorMessage } from "../helpers/msgError.js";

export default class EstateOwnersController {

    // Obtener todos
    static async getAllEstateOwners(req, res) {
        try {
            const estateOwners = await EstateOwnersService.getAllEstateOwners();
            if (!estateOwners || estateOwners.length === 0) {
                return res.status(404).json({ msg: ErrorMessage.GLOBAL.NO_DATA });
            }
            return res.status(200).json({ msg: ErrorMessage.GLOBAL.DATA, EstateOwners: estateOwners });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });
        }
    }

    // Crear
    static async createEstateOwners(req, res) {
        try {
            const data = req.body;
            const result = await EstateOwnersService.createEstateOwners(data);
            if (!result) {
                return res.status(400).json({ msg: ErrorMessage.ESTATE_OWNERS.DUPLICATE });
            }
            return res.status(201).json({ msg: ErrorMessage.GLOBAL.CREATE });
        } catch (error) {
            return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });
        }
    }

    // Actualizar por ID ÚNICO
    static async updateEstateOwners(req, res) {
        try {
            const { id } = req.params;
            const { ownership_precent } = req.body;

            const result = await EstateOwnersService.updateEstateOwners(id, ownership_precent);
            if (!result) {
                return res.status(400).json({ msg: ErrorMessage.GLOBAL.ERROR_UPDATE });
            }
            return res.json({ msg: ErrorMessage.GLOBAL.UPDATE });
        } catch (error) {
            return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });
        }
    }

    // Eliminar por ID ÚNICO
    static async deleteEstateOwners(req, res) {
        try {
            const { id } = req.params;

            const result = await EstateOwnersService.deleteEstateOwners(id);
            if (!result) {
                return res.status(400).json({ msg: ErrorMessage.GLOBAL.ERROR_DELETE });
            }
            res.json({ msg: ErrorMessage.GLOBAL.DELETE });
        } catch (error) {
            return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });
        }
    }
}