import UserService from "../services/usersServices.js";

/**
 * Controlador de usuarios del sistema
 *  Maneja correctamente los retornos null del servicio
 */
export default class UserController {

    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            if (!users.length) {
                return res.status(404).json("No se encontraron usuarios");
            }
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ========================================

    static async getUsername(req, res) {
        try {
            const {username} = req.params;
            const user = await UserService.getUserByUsername(username);
            if (!user.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getEmail(req, res) {
        try {
            const {email} = req.params;
            const userEmail = await UserService.getUserByEmail(email);
            if (!userEmail.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userEmail);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getPhone(req, res) {
        try {
            const {phone} = req.params;
            const userPhone = await UserService.getUserByPhone(phone);
            if (!userPhone.length) {
                return res.status(404).json("Usuario no encontrado");
            }
            return res.status(200).json(userPhone);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async getUserId(req, res) {
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
            console.log(error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // CRUD CON MANEJO CORREGIDO
    // ========================================

    /**
     * Crear usuario
     * ✅ CORREGIDO: Maneja null como duplicado con mensaje informativo
     */
    static async createUser(req, res) {
        try {
            const result = await UserService.createUser(req.body);
            if (!result.length) {
                // Mensaje informativo que ayuda al usuario a identificar el problema
                return res.status(409).json('Usuario duplicado.. Puede ser nombre de usuario email o teléfono.');
            }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Actualizar usuario
     * ✅ CORREGIDO: Maneja null apropiadamente
     */
    static async updateUser(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const updated = await UserService.updateUser(id, req.body);
            if (!updated.length) {
                // Mensaje que cubre tanto duplicados como usuario no encontrado
                return res.status(409).json('Usuario duplicado o no encontrado');
            }
            return res.status(200).json(updated);
        } catch (error) {
            console.log(error)
            return res.status(500).json("Error interno del servidor");
        }
    }

    static async deleteUser(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await UserService.deleteUser(id);
            if (!deleted.length) {
                return res.status(400).json("Error al eliminar usuario");
            }
            return res.status(204).json('Eliminado correctamente.');
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
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