import EstateService from '../services/estatesServices.js';

/**
 * Controlador de propiedades inmobiliarias
 * Maneja requests HTTP para operaciones CRUD de inmuebles
 */
export default class EstateController {

    static async getAllEstate(req, res, next) {
        try {
            const estate = await EstateService.getAllEstates();
            if (!estate.length) {
                return res.status(404).json("No se encontraron inmuebles");
            }
            return res.status(200).json(estate);
        } catch (error) {
            next(error);
        }
    }

    static async getAllForDropdownEstates(req, res, next) {
        try {
            const estates = await EstateService.getAllForDropdownEstates();
            if (!estates.length) {
                return res.status(404).json("No se encontraron inmuebles");
            }
            return res.status(200).json(estates);
        } catch (error) {
            next(error);
        }
    }

    static async getByCadastralReference(req, res, next) {
        try {
            const {cadastral} = req.params;
            if (!cadastral || typeof cadastral !== 'string' || cadastral.trim() === '') {
                return res.status(400).json("Referencia catastral requerida");
            }
            const result = await EstateService.getByCadastralReference(cadastral);
            if (!result.length) {
                return res.status(404).json("Inmueble no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json("ID inválido");
            }
            const result = await EstateService.getEstateById(id);
            if (!result.length) {
                return res.status(404).json("Inmueble no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async createEstate(req, res, next) {
        try {
            const {cadastral_reference, price, address, postal_code, location, province, country, surface} = req.body;
            const created = await EstateService.createEstate({cadastral_reference, price, address, postal_code, location, province, country, surface});
            if (!created || created.length === 0) {
                return res.status(400).json('Error al crear inmueble o referencia catastral duplicada');
            }
            return res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    }

    static async updateEstate(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const {cadastral_reference, price, address, postal_code, location, province, country, surface} = req.body;
            const updated = await EstateService.updateEstate(id, {cadastral_reference, price, address, postal_code, location, province, country, surface});
            if (!updated || !updated.length) {
                return res.status(400).json("Error al actualizar inmueble o referencia catastral duplicada");
            }
            return res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    static async deleteEstate(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await EstateService.deleteEstate(id);
            if (!deleted || !deleted.length) {
                return res.status(400).json("Error al eliminar inmueble");
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
