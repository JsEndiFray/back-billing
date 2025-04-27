import OwnersServices from "../services/ownersServices.js";
import {ErrorMessage} from "../utils/msgError.js";
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


    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    //crear usuario
    static async createOwner(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: ErrorMessage.GLOBAL.ERROR_VALIDATE,
                    errors: errors.array()
                })
            }
            const created = await OwnersServices.createOwner(req.body);
            if (created?.duplicated) {
                return res.status(400).json({msg: ErrorMessage.OWNERS.DUPLICATE});
            }
            if (!created) {
                return res.status(400).json({ msg: ErrorMessage.GLOBAL.ERROR_CREATE });
            }
            return res.status(201).json({msg: ErrorMessage.GLOBAL.CREATE})

        } catch (error) {
                console.error('Error al crear Owner:', error);
                return res.status(500).json({ msg: ErrorMessage.GLOBAL.INTERNAL });

        }


    }


}