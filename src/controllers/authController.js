/**
 * @fileoverview Controlador para la autenticación de usuarios.
 * Maneja el login y la renovación de tokens.
 */

import UserService from "../services/usersServices.js";

export default class AuthController {

    /**
     * Maneja el inicio de sesión del usuario.
     * @param {object} req - Objeto de solicitud de Express.
     * @param {object} res - Objeto de respuesta de Express.
     */
    static async login(req, res) {
        // 1. Extrae las credenciales del cuerpo de la petición.
        const {username, password} = req.body;

        // 2. Valida que los campos no estén vacíos.
        if (!username || !password) {
            return res.status(400).json("Usuario y contraseña requeridos");
        }

        // 3. Delega la lógica de negocio al servicio de usuarios.
        const result = await UserService.login(username, password);

        // 4. Si la autenticación falla (el servicio devuelve null), responde con error.
        if (!result) {
            return res.status(401).json("Credenciales inválidas");
        }
        // 5. Si la autenticación es exitosa, devuelve los datos del usuario y los tokens.
        return res.status(200).json({
            user: result.user,           // 👤 Datos del usuario (id, username, email, role)
            accessToken: result.accessToken,    // 🎫 Token de acceso inmediato
            refreshToken: result.refreshToken   // 🔄 Token para renovaciones futuras
        });
    }

    /**
     * Renueva el token de acceso usando un token de refresco válido.
     * @param {object} req - Objeto de solicitud de Express.
     * @param {object} res - Objeto de respuesta de Express.
     */
    static async refreshToken(req, res) {
        // 1. Extrae el token de refresco del cuerpo de la petición.
        const {refreshToken} = req.body;

        // 2. Valida que el token de refresco exista.
        if (!refreshToken) {
            return res.status(400).json("Token de actualización requerido");
        }

        // 3. Delega la lógica de renovación al servicio de usuarios.
        const tokens = await UserService.refreshToken(refreshToken);

        // 4. Si la renovación falla (el servicio devuelve null), responde con error.
        if (!tokens) {
            return res.status(401).json("Token expirado o inválido");
        }

        // 5. Si la renovación es exitosa, devuelve el nuevo token de acceso.
        return res.status(200).json({
            accessToken: tokens.accessToken,    // 🆕 Nuevo token de acceso
            refreshToken: tokens.refreshToken   // 🔄 Token de renovación (igual o nuevo)
        });
    }
}