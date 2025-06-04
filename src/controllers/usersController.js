import UserService from "../services/usersServices.js";

export default class UserController {

    // Obtener todos los usuarios registrados
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            if (!users || users.length === 0) {
                return res.status(404).json("No se encontraron usuarios");
            }
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por username
    static async getUsername(req, res) {
        try {
            const {username} = req.params;
            const user = await UserService.getUsername(username);
            if (!user) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por email
    static async getEmail(req, res) {
        try {
            const {email} = req.params;
            const userEmail = await UserService.getUserEmail(email);
            if (!userEmail) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userEmail);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por phone
    static async getPhone(req, res) {
        try {
            const {phone} = req.params;
            const userPhone = await UserService.getUserPhone(phone);
            if (!userPhone) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userPhone);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Buscar por ID
    static async getUserId(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const userId = await UserService.getUserId(id);
            if (!userId) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userId);
        } catch (error) {
            console.log(error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Crear usuario
    static async createUser(req, res) {
        try {
            const user = req.body;
            const result = await UserService.createUser(user);
            if (result?.duplicated) {
                console.log(result);
                return res.status(409).json(`Usuario duplicado: ${result.duplicated}`);
            }
            if (!result) {
                return res.status(400).json("Error al crear usuario");
            }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Actualizar usuario
    static async updateUser(req, res) {
        try {
            const {id} = req.params;
            const data = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const updated = await UserService.updateUser(id, data);

            if (updated?.duplicated) {
                return res.status(409).json(`Usuario duplicado: ${updated.duplicated}`);
            }
            if (!updated) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(updated);
        } catch (error) {
            console.log(error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Eliminar usuario
    static async deleteUser(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await UserService.deleteUser(id);
            if (!deleted) {
                return res.status(400).json("Error al eliminar usuario");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}
