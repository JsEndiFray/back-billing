import OwnersServices from "../services/ownersServices.js";

export default class OwnersControllers {

    // Obtener los owners
    static async getAllOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllOwners();
            if (!owners || owners.length === 0) {
                return res.status(404).json("No se encontraron propietarios");
            }
            return res.status(200).json(owners);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Obtener todos los propietarios para dropdown (ID y nombre)
    static async getAllForDropdownOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllForDropdownOwners();
            if (!owners || owners.length === 0) {
                return res.status(404).json("No se encontraron propietarios");
            }
            return res.status(200).json(owners);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por nombre, apellido o nif
    static async getOwner(req, res) {
        try {
            const { name, lastname, nif } = req.query;
            const owner = await OwnersServices.getOwner(name, lastname, nif);
            if (!owner) {
                return res.status(404).json("Propietario no encontrado");
            }
            return res.status(200).json(owner);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Obtener un propietario por ID
    static async getOwnerId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const owner = await OwnersServices.getOwnerId(id);
            if (!owner) {
                return res.status(404).json("Propietario no encontrado");
            }
            return res.status(200).json(owner);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Crear propietario
    static async createOwner(req, res) {
        try {
            const created = await OwnersServices.createOwner(req.body);
            if (created?.duplicated) {
                return res.status(409).json("Propietario duplicado");
            }
            if (!created) {
                return res.status(400).json("Error al crear propietario");
            }
            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Actualizar propietario
    static async updateOwner(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const existing = await OwnersServices.getOwnerId(id);
            if (!existing) {
                return res.status(404).json("Propietario no encontrado");
            }
            const updated = await OwnersServices.updateOwner(id, req.body);
            if (!updated) {
                return res.status(409).json("Propietario duplicado");
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Eliminar propietario
    static async deleteOwner(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await OwnersServices.deleteOwner(id);
            if (!deleted) {
                return res.status(404).json("Propietario no encontrado");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}
