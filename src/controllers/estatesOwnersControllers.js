import EstateOwnersService from "../services/estatesOwnersServices.js";
import { createEstateOwnerDTO, updateEstateOwnerDTO } from "../dto/estateOwner.dto.js";

export default class EstateOwnersController {

    static async getAllEstateOwners(req, res, next) {
        try {
            const estateOwners = await EstateOwnersService.getAllEstateOwners();
            if (!estateOwners.length) {
                return res.status(404).json({ success: false, message: "No se encontraron relaciones inmueble-propietario" });
            }
            return res.status(200).json({ success: true, data: estateOwners });
        } catch (error) {
            next(error);
        }
    }

    static async getEstateOwnersById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id)) || Number(id) <= 0) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await EstateOwnersService.getEstateOwnerById(Number(id));
            if (!result.length) {
                return res.status(404).json({ success: false, message: "Inmueble y propietario no encontrado" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async createEstateOwners(req, res, next) {
        try {
            const dto = createEstateOwnerDTO(req.body);
            const result = await EstateOwnersService.createEstateOwners(dto);
            if (!result.length) {
                return res.status(409).json({ success: false, message: "Relación inmueble-propietario duplicada" });
            }
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async updateEstateOwners(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const dto = updateEstateOwnerDTO(req.body);
            const result = await EstateOwnersService.updateEstateOwner(Number(id), dto.ownership_percentage);
            if (!result || !result.length) {
                return res.status(404).json({ success: false, message: "Relación inmueble-propietario no encontrada" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async deleteEstateOwners(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await EstateOwnersService.deleteEstateOwners(id);
            if (!result.length) {
                return res.status(404).json({ success: false, message: "Relación inmueble-propietario no encontrada" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
