/**
 * @fileoverview Controlador para la autenticación de usuarios.
 * Maneja el login, renovación de tokens y logout.
 */

import UserService from "../services/usersServices.js";

const COOKIE_NAME    = 'refreshToken';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAME_SITE || 'Strict',
        maxAge:   COOKIE_MAX_AGE,
        path:     '/api/auth',
    };
}

export default class AuthController {

    /**
     * Maneja el inicio de sesión del usuario.
     */
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
            }

            const result = await UserService.login(username, password);

            // Set refresh token in httpOnly cookie
            res.cookie(COOKIE_NAME, result.refreshToken, refreshCookieOptions());

            return res.status(200).json({
                success: true,
                data: {
                    user:         result.user,
                    accessToken:  result.accessToken,
                    refreshToken: result.refreshToken, // kept for backward-compat with current frontend
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Renueva el token de acceso usando un token de refresco válido.
     * Acepta el token desde cookie httpOnly o desde req.body (compatibilidad).
     */
    static async refreshToken(req, res, next) {
        try {
            // Cookie takes priority; fall back to body for backward compatibility
            const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

            const tokens = await UserService.refreshToken(token);

            // Rotate cookie
            res.cookie(COOKIE_NAME, tokens.refreshToken, refreshCookieOptions());

            return res.status(200).json({
                success: true,
                data: {
                    accessToken:  tokens.accessToken,
                    refreshToken: tokens.refreshToken, // kept for backward-compat
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cierra sesión: revoca el refresh token y borra la cookie.
     */
    static async logout(req, res, next) {
        try {
            const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

            await UserService.logout(token);

            res.clearCookie(COOKIE_NAME, { path: '/api/auth' });

            return res.status(200).json({ success: true, message: 'Sesión cerrada' });
        } catch (error) {
            next(error);
        }
    }
}
