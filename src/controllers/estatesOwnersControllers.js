import EstateOwnersService from "../services/estatesOwnersServices.js";

export default class EstateOwnersController {

    static async getAllEstateOwners(req, res, next) {
        try {
            const estateOwners = await EstateOwnersService.getAllEstateOwners();
            if (!estateOwners.length) {
                return res.status(404).json("No se encontraron relaciones inmueble-propietario");
            }
            return res.status(200).json(estateOwners);
        } catch (error) {
            next(error);
        }
    }

    static async getEstateOwnersById(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id)) || Number(id) <= 0) {
                return res.status(400).json("ID inválido");
            }
            const result = await EstateOwnersService.getEstateOwnerById(Number(id));
            if (!result.length) {
                return res.status(404).json("Inmueble y propietario no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async createEstateOwners(req, res, next) {
        try {
            const data = req.body;
            const result = await EstateOwnersService.createEstateOwners(data);
            if (!result.length) {
                return res.status(409).json("Relación inmueble-propietario duplicada");
            }
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updateEstateOwners(req, res, next) {
        try {
            const {id} = req.params;
            const {ownership_percentage} = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            if (ownership_percentage === undefined || ownership_percentage === null) {
                return res.status(400).json("Porcentaje de propiedad es requerido");
            }

            const result = await EstateOwnersService.updateEstateOwner(Number(id), ownership_percentage);
            if (!result || !result.length) {
                return res.status(404).json("Relación inmueble-propietario no encontrada");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deleteEstateOwners(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await EstateOwnersService.deleteEstateOwners(id);
            if (!result.length) {
                return res.status(404).json("Relación inmueble-propietario no encontrada");
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
