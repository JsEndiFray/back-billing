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
    static async login(req, res, next) {
        try {
            const {username, password} = req.body;

            if (!username || !password) {
                return res.status(400).json("Usuario y contraseña requeridos");
            }

            const result = await UserService.login(username, password);
            return res.status(200).json({
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Renueva el token de acceso usando un token de refresco válido.
     * @param {object} req - Objeto de solicitud de Express.
     * @param {object} res - Objeto de respuesta de Express.
     */
    static async refreshToken(req, res, next) {
        try {
            const {refreshToken} = req.body;

            const tokens = await UserService.refreshToken(refreshToken);
            return res.status(200).json({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }
}