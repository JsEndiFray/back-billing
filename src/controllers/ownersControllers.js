import OwnersServices from "../services/ownersServices.js";

/**
 * Controlador de propietarios
 * Maneja personas físicas o jurídicas que poseen inmuebles
 */
export default class OwnersControllers {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllOwners();
            if (!owners.length) {
                return res.status(404).json("No se encontraron propietarios");
            }
            return res.status(200).json(owners);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Para dropdown de propietarios
     * Nota: Usa 404 - podrías considerar 200+[] para mejor UX
     */
    static async getAllForDropdownOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllForDropdownOwners();
            if (!owners.length) {
                return res.status(404).json("No se encontraron propietarios");
                // Alternativa UX: return res.status(200).json([]);
            }
            return res.status(200).json(owners);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ========================================

    /**
     * Búsqueda flexible por nombre, apellido o NIF usando query parameters
     * Permite buscar por uno o varios campos simultáneamente
     */
    static async getOwner(req, res) {
        try {
            const {name, lastname, nif} = req.query;
            const owner = await OwnersServices.getOwner(name, lastname, nif);
            if (!owner.length) {
                return res.status(404).json("Propietario no encontrado");
            }
            return res.status(200).json(owner);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getOwnerId(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const owner = await OwnersServices.getOwnerById(id);
            if (!owner.length > 0) {
                return res.status(404).json("Propietario no encontrado");
            }
            return res.status(200).json(owner);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // OPERACIONES CRUD
    // ========================================

    /**
     * Crear propietario
     */
    static async createOwner(req, res) {
        try {
            const created = await OwnersServices.createOwner(req.body);

            if (!created.length) {
                return res.status(400).json("Error al crear propietario o identificación duplicada");
            }
            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async updateOwner(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            /*const existing = await OwnersServices.getOwnerById(req.params);
            if (!existing.length > 0) {
                return res.status(404).json("Propietario no encontrado");
            }*/

            const updated = await OwnersServices.updateOwner(id, req.body);
            if (!updated.length > 0) {
                return res.status(409).json("Propietario duplicado");
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async deleteOwner(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const deleted = await OwnersServices.deleteOwner(id);
            if (!deleted.length) {
                return res.status(404).json("Propietario no encontrado");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}

/**
 * CARACTERÍSTICAS DISTINTIVAS:
 * 1. getOwner usa query parameters (?name=Juan&lastname=Pérez)
 *    en lugar de path parameters (/owners/:name/:lastname)
 * 2. Búsqueda flexible por múltiples campos
 * 3. PATRÓN CONSISTENTE: SIEMPRE verificar !array.length
 * 4. Códigos HTTP estándar y validaciones uniformes
 */