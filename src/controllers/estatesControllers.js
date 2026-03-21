import EstateService from '../services/estatesServices.js';
import { createEstateDTO, updateEstateDTO } from '../dto/estate.dto.js';

export default class EstateController {

    static async getAllEstate(req, res, next) {
        try {
            const estate = await EstateService.getAllEstates();
            if (!estate.length) {
                return res.status(404).json({ success: false, message: "No se encontraron inmuebles" });
            }
            return res.status(200).json({ success: true, data: estate });
        } catch (error) {
            next(error);
        }
    }

    static async getAllForDropdownEstates(req, res, next) {
        try {
            const estates = await EstateService.getAllForDropdownEstates();
            if (!estates.length) {
                return res.status(404).json({ success: false, message: "No se encontraron inmuebles" });
            }
            return res.status(200).json({ success: true, data: estates });
        } catch (error) {
            next(error);
        }
    }

    static async getByCadastralReference(req, res, next) {
        try {
            const { cadastral } = req.params;
            if (!cadastral || typeof cadastral !== 'string' || cadastral.trim() === '') {
                return res.status(400).json({ success: false, message: "Referencia catastral requerida" });
            }
            const result = await EstateService.getByCadastralReference(cadastral);
            if (!result.length) {
                return res.status(404).json({ success: false, message: "Inmueble no encontrado" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await EstateService.getEstateById(id);
            if (!result.length) {
                return res.status(404).json({ success: false, message: "Inmueble no encontrado" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async createEstate(req, res, next) {
        try {
            const dto = createEstateDTO(req.body);
            const created = await EstateService.createEstate(dto);
            if (!created || created.length === 0) {
                return res.status(400).json({ success: false, message: "Error al crear inmueble o referencia catastral duplicada" });
            }
            return res.status(201).json({ success: true, data: created });
        } catch (error) {
            next(error);
        }
    }

    static async updateEstate(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const dto = updateEstateDTO(req.body);
            const updated = await EstateService.updateEstate(id, dto);
            if (!updated || !updated.length) {
                return res.status(400).json({ success: false, message: "Error al actualizar inmueble o referencia catastral duplicada" });
            }
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async deleteEstate(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const deleted = await EstateService.deleteEstate(id);
            if (!deleted || !deleted.length) {
                return res.status(400).json({ success: false, message: "Error al eliminar inmueble" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
