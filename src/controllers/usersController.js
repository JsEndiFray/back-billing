import UserService from "../services/usersServices.js";
import {ErrorMessage} from "../helpers/msgError.js";

export default class UserController {

    //obtener todos los usuarios registrados
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            if (!users || users.length === 0) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.NO_DATA});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, users: users});
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //métodos de búsquedas

    //búsqueda por username
    static async getUsername(req, res) {
        try {
            const {username} = req.params;
            const user = await UserService.getUsername(username);
            if (!user) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, user: user});
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //búsqueda por email
    static async getEmail(req, res) {
        try {
            const {email} = req.params;
            const userEmail = await UserService.getUserEmail(email);
            if (!userEmail) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, email: userEmail});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //búsqueda por phone
    static async getPhone(req, res) {
        try {
            const {phone} = req.params;
            const userPhone = await UserService.getUserPhone(phone);
            if (!userPhone) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, phone: userPhone});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    // Buscar por ID
    static async getUserId(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const userId = await UserService.getUserId(id);
            if (!userId) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, id: userId});
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //MÉTODOS CREATE UPDATE DELETE

    //Crear usuario
    static async createUser(req, res) {
        try {
            const user = req.body;
            const result = await UserService.createUser(user);
            if (result?.duplicated) {
                return res.status(400).json({msg: ErrorMessage.USERS.DUPLICATE, duplicated: result});
            }
            if (!result){
                return res.status(500).json({msg: ErrorMessage.GLOBAL.ERROR_CREATE});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.CREATE, users: result});
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }
//update el usuario
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const updated = await UserService.updateUser(id, data);
            if (!updated) {
                console.log(updated)
                return res.status(404).json({ msg: ErrorMessage.GLOBAL.NOT_FOUND });
            }
             return  res.status(200).json({ msg: ErrorMessage.GLOBAL.UPDATE, update: updated });
        } catch (error) {
            console.log(error);
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }
    // Eliminar usuario
    static async deleteUser(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const deleted = await UserService.deleteUser(id);
            if (!deleted) {
                return res.status(404).json({ msg: ErrorMessage.GLOBAL.ERROR_DELETE});
            }
            return  res.status(200).json({ msg: ErrorMessage.GLOBAL.DELETE });

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

}