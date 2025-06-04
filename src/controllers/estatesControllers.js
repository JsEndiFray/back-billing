import EstateService from '../services/estatesServices.js';

export default class EstateController {

    // Obtener los inmuebles
    static async getAllEstate(req, res) {
        try {
            const estate = await EstateService.getAllEstate();
            if (!estate || estate.length === 0) {
                return res.status(404).json("No se encontraron inmuebles");
            }
            return res.status(200).json(estate);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Obtener todos los inmuebles para dropdown (ID y datos básicos)
    static async getAllForDropdownEstates(req, res) {
        try {
            const estates = await EstateService.getAllForDropdownEstates();
            if (!estates || estates.length === 0) {
                return res.status(404).json("No se encontraron inmuebles");
            }
            return res.status(200).json(estates);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda de inmueble por referencia catastral
    static async getByCadastralReference(req, res) {
        try {
            const {cadastral} = req.params;
            if (!cadastral || typeof cadastral !== 'string' || cadastral.trim() === '') {
                return res.status(400).json("Referencia catastral requerida");
            }
            const result = await EstateService.getByCadastralReference(cadastral);
            if (!result || result.length === 0) {
                return res.status(404).json("Inmueble no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda de inmuebles por ID
    static async getById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json("ID inválido");
            }
            const result = await EstateService.getById(id);
            if (!result) {
                return res.status(404).json("Inmueble no encontrado");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Crear inmueble
    static async createEstate(req, res) {
        try {
            const {cadastral_reference} = req.body;
            const existing = await EstateService.getByCadastralReference(cadastral_reference);
            if (existing && existing.length > 0) {
                return res.status(409).json("Inmueble duplicado");
            }

            const created = await EstateService.createEstate(req.body);
            if (!created) {
                return res.status(400).json("Error al crear inmueble");
            }

            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Actualizar inmueble
    static async updateEstate(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const existing = await EstateService.getById(id);
            if (!existing) {
                return res.status(404).json("Inmueble no encontrado");
            }
            const updated = await EstateService.updateEstate(id, req.body);
            if (!updated) {
                return res.status(400).json("Error al actualizar inmueble en la base de datos");
            }

            return res.status(200).json(updated);

        } catch (error) {
            console.error('Error al actualizar inmueble:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Eliminar inmueble
    static async deleteEstate(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const existing = await EstateService.getById(id);
            if (!existing) {
                return res.status(404).json("Inmueble no encontrado");
            }

            const deleted = await EstateService.deleteService(id);
            if (!deleted) {
                return res.status(400).json("Error al eliminar inmueble");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}