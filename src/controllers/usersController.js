import UserService from "../services/usersServices.js";
import { ErrorCodes, sendError, sendSuccess, ErrorMessages } from "../errors/index.js";

export default class UserController {

    //obtener todos los usuarios registrados
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            if (!users || users.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], users);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //métodos de búsquedas

    //búsqueda por username
    static async getUsername(req, res) {
        try {
            const { username } = req.params;
            const user = await UserService.getUsername(username);
            if (!user) {
                return sendError(res, ErrorCodes.USER_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA],user);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //búsqueda por email
    static async getEmail(req, res) {
        try {
            const { email } = req.params;
            const userEmail = await UserService.getUserEmail(email);
            if (!userEmail) {
                return sendError(res, ErrorCodes.USER_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA],userEmail);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //búsqueda por phone
    static async getPhone(req, res) {
        try {
            const { phone } = req.params;
            const userPhone = await UserService.getUserPhone(phone);
            if (!userPhone) {
                return sendError(res, ErrorCodes.USER_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], userPhone);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Buscar por ID
    static async getUserId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const userId = await UserService.getUserId(id);
            if (!userId) {
                return sendError(res, ErrorCodes.USER_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA],userId);
        } catch (error) {
            console.log(error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    //MÉTODOS CREATE UPDATE DELETE

    //Crear usuario
    static async createUser(req, res) {
        try {
            const user = req.body;
            const result = await UserService.createUser(user);
            if (result?.duplicated) {
                console.log(result);
                return sendError(res, ErrorCodes.USER_DUPLICATE, { duplicated: result.duplicated });
            }
            if (!result) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_CREATE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_CREATE],result);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
    //update el usuario
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const updated = await UserService.updateUser(id, data);

            if (updated?.duplicated) {
                return sendError(res, ErrorCodes.USER_DUPLICATE, {
                    duplicated: updated.duplicated // 'username', 'email', 'phone', etc.
                });
            }
            if (!updated) {
                return sendError(res, ErrorCodes.USER_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_UPDATE],updated);
        } catch (error) {
            console.log(error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
    // Eliminar usuario
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const deleted = await UserService.deleteUser(id);
            if (!deleted) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_DELETE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DELETE]);

        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
}