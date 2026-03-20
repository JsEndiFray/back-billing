import UserService from "../services/usersServices.js";

/**
 * Controlador de usuarios del sistema
 *  Maneja correctamente los retornos null del servicio
 */
export default class UserController {

    static async getAllUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            if (!users.length) {
                return res.status(404).json("No se encontraron usuarios");
            }
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    // ========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ========================================

    static async getUsername(req, res, next) {
        try {
            const {username} = req.params;
            const user = await UserService.getUserByUsername(username);
            if (!user.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    static async getEmail(req, res, next) {
        try {
            const {email} = req.params;
            const userEmail = await UserService.getUserByEmail(email);
            if (!userEmail.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userEmail);
        } catch (error) {
            next(error);
        }
    }

    static async getPhone(req, res, next) {
        try {
            const {phone} = req.params;
            const userPhone = await UserService.getUserByPhone(phone);
            if (!userPhone.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userPhone);
        } catch (error) {
            next(error);
        }
    }

    static async getUserId(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const userId = await UserService.getUserById(id);
            if (!userId.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userId);
        } catch (error) {
            next(error);
        }
    }

    // ========================================
    // CRUD CON MANEJO CORREGIDO
    // ========================================

    /**
     * Crear usuario
     * ✅ CORREGIDO: Maneja null como duplicado con mensaje informativo
     */
    static async createUser(req, res, next) {
        try {
            const {username, password, email, phone, role} = req.body;
            const result = await UserService.createUser({username, password, email, phone, role});
            if (!result.length) {
                // Mensaje informativo que ayuda al usuario a identificar el problema
                return res.status(409).json('Usuario duplicado.. Puede ser nombre de usuario email o teléfono.');
            }
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar usuario
     * ✅ CORREGIDO: Maneja null apropiadamente
     */
    static async updateUser(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const {username, password, email, phone, role} = req.body;
            const updated = await UserService.updateUser(id, {username, password, email, phone, role});
            if (!updated.length) {
                // Mensaje que cubre tanto duplicados como usuario no encontrado
                return res.status(409).json('Usuario duplicado o no encontrado');
            }
            return res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await UserService.deleteUser(id);
            if (!deleted.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

/**
 * ✅ MEJORAS APLICADAS:
 * 1. Eliminó manejo de objetos {duplicated}
 * 2. Mensajes informativos para duplicados
 * 3. Códigos HTTP apropiados (409 para conflictos)
 * 4. Consistencia con otros controladores
 *
 * MENSAJES UX-FRIENDLY:
 * - "Usuario duplicado.. Puede ser nombre de usuario email o teléfono."
 * - "Usuario duplicado o no encontrado"
 */