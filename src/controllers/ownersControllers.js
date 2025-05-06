import OwnersServices from "../services/ownersServices.js";
import {ErrorMessage} from "../helpers/msgError.js";
import {validationResult} from "express-validator";


export default class OwnersControllers {

    //obtener los owners
    static async getAllOwners(req, res) {
        try {
            const owners = await OwnersServices.getAllOwners();
            if (!owners || owners.length === 0) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, owners: owners});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por nombre, apellido o nif
    static async getOwner(req, res) {
        try {
            const {name, lastname, nif} = req.query;
            const owner = await OwnersServices.getOwner(name, lastname, nif);
            if (!owner) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.NO_DATA})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, owner: owner});
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    // Obtener un usuario por ID
    static async getOwnerId(req, res) {
        try {
            const {id} = req.params
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const owner = await OwnersServices.getOwnerId(id);
            if (!owner) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, owner: owner});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    //crear usuario
    static async createOwner(req, res) {
        try {
            const created = await OwnersServices.createOwner(req.body);
            if (created?.duplicated) {
                return res.status(400).json({msg: ErrorMessage.OWNERS.DUPLICATE});
            }
            if (!created) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.ERROR_CREATE});
            }
            return res.status(201).json({
                msg: ErrorMessage.GLOBAL.CREATE,
                owner: created
            });
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //actualizar usuarios
    static async updateOwner(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const existing = await OwnersServices.getOwnerId(id);
            if (!existing) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NOT_FOUND})
            }
            const updated = await OwnersServices.updateOwner(id, req.body);
            if (!updated) {
                return res.status(400).json({msg: ErrorMessage.OWNERS.DUPLICATE});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.UPDATE, owner: updated});

        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });
        }
    }
    //eliminar owners
    static async deleteOwner(req, res) {
        try{
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const deleted = await OwnersServices.deleteOwner(id);
            if(!deleted) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NOT_FOUND})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DELETE});

        }catch(error){
            console.log(error)
            return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });
        }
    }

}