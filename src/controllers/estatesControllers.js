import EstateService from '../services/estatesServices.js';

/**
 * Controlador de propiedades inmobiliarias
 * Maneja requests HTTP para operaciones CRUD de inmuebles
 */
export default class EstateController {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllEstate(req, res) {
        try {
            const estate = await EstateService.getAllEstates();
            if (!estate.length) {
                return res.status(404).json("No se encontraron inmuebles");
            }
            return res.status(200).json(estate);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Para dropdown de inmuebles
     * Nota: Usa 404 - podrías considerar 200+[] para mejor UX en dropdowns
     */
    static async getAllForDropdownEstates(req, res) {
        try {
            const estates = await EstateService.getAllForDropdownEstates();
            if (!estates.length) {
                return res.status(404).json("No se encontraron inmuebles");
                // Alternativa UX: return res.status(200).json([]);
            }
            return res.status(200).json(estates);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ========================================

    /**
     * Busca por referencia catastral (identificador único)
     */
    static async getByCadastralReference(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getById(req, res) {
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
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // OPERACIONES CRUD
    // ========================================

    /**
     * Crear inmueble con validación extra de duplicados
     * Nota: Esta validación ya debería estar en el servicio
     */
    static async createEstate(req, res) {
        try {
            const created = await EstateService.createEstate(req.body);
            if (!created.length > 0) {
                return res.status(400).json('Error al crear inmueble o referencia catastral duplicada');
            }
            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async updateEstate(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const existing = await EstateService.getEstateById(id);
            if (!existing.length) {
                return res.status(404).json("Inmueble no encontrado");
            }

            const updated = await EstateService.updateEstate(id, req.body);
            if (!updated.length) {
                return res.status(400).json("Error al actualizar inmueble o referencia catastral duplicada");
            }

            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Eliminar inmueble
     * Nota: Llama a deleteEstate - asegúrate que el método del servicio coincida
     */
    static async deleteEstate(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const existing = await EstateService.getEstateById(id);
            if (!existing.length) {
                return res.status(404).json("Inmueble no encontrado");
            }

            const deleted = await EstateService.deleteEstate(id);
            if (!deleted.length) {
                return res.status(400).json("Error al eliminar inmueble");
            }
            return res.status(204).send(); // No content - eliminación exitosa
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}

/**
 * OBSERVACIONES:
 * 1. Más simple que ClientsController - sin lógica de relaciones complejas
 * 2. createEstate hace validación duplicada que ya está en el servicio
 * 3. getAllForDropdownEstates podría usar 200+[] para mejor UX
 * 4. Validaciones básicas de parámetros funcionan bien
 */