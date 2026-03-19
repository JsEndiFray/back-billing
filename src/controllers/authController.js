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
        try {
            const {username, password} = req.body;

            if (!username || !password) {
                return res.status(400).json("Usuario y contraseña requeridos");
            }

            const result = await UserService.login(username, password);

            if (!result) {
                return res.status(401).json("Credenciales inválidas");
            }
            return res.status(200).json({
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            });
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Renueva el token de acceso usando un token de refresco válido.
     * @param {object} req - Objeto de solicitud de Express.
     * @param {object} res - Objeto de respuesta de Express.
     */
    static async refreshToken(req, res) {
        try {
            const {refreshToken} = req.body;

            if (!refreshToken) {
                return res.status(400).json("Token de actualización requerido");
            }

            const tokens = await UserService.refreshToken(refreshToken);

            if (!tokens) {
                return res.status(401).json("Token expirado o inválido");
            }

            return res.status(200).json({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}