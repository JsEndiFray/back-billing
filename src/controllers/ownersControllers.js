import OwnersServices from "../services/ownersServices.js";
import { createOwnerDTO, updateOwnerDTO } from "../dto/owner.dto.js";

export default class OwnersControllers {

    static async getAllOwners(req, res, next) {
        try {
            const owners = await OwnersServices.getAllOwners();
            if (!owners.length) {
                return res.status(404).json({ success: false, message: "No se encontraron propietarios" });
            }
            return res.status(200).json({ success: true, data: owners });
        } catch (error) {
            next(error);
        }
    }

    static async getAllForDropdownOwners(req, res, next) {
        try {
            const owners = await OwnersServices.getAllForDropdownOwners();
            if (!owners.length) {
                return res.status(404).json({ success: false, message: "No se encontraron propietarios" });
            }
            return res.status(200).json({ success: true, data: owners });
        } catch (error) {
            next(error);
        }
    }

    static async getOwner(req, res, next) {
        try {
            const { name, lastname, nif } = req.query;
            const owner = await OwnersServices.getOwner(name, lastname, nif);
            if (!owner.length) {
                return res.status(404).json({ success: false, message: "Propietario no encontrado" });
            }
            return res.status(200).json({ success: true, data: owner });
        } catch (error) {
            next(error);
        }
    }

    static async getOwnerId(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const owner = await OwnersServices.getOwnerById(id);
            if (!owner || owner.length === 0) {
                return res.status(404).json({ success: false, message: "Propietario no encontrado" });
            }
            return res.status(200).json({ success: true, data: owner });
        } catch (error) {
            next(error);
        }
    }

    static async createOwner(req, res, next) {
        try {
            const dto = createOwnerDTO(req.body);
            const created = await OwnersServices.createOwner(dto);
            if (!created.length) {
                return res.status(400).json({ success: false, message: "Error al crear propietario o identificación duplicada" });
            }
            return res.status(201).json({ success: true, data: created });
        } catch (error) {
            next(error);
        }
    }

    static async updateOwner(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const dto = updateOwnerDTO(req.body);
            const updated = await OwnersServices.updateOwner(id, dto);
            if (!updated || updated.length === 0) {
                return res.status(404).json({ success: false, message: "Propietario no encontrado" });
            }
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async deleteOwner(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const deleted = await OwnersServices.deleteOwner(id);
            if (!deleted.length) {
                return res.status(404).json({ success: false, message: "Propietario no encontrado" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
