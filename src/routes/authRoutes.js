import express from "express";
import AuthController from "../controllers/authController.js";

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: API para gestión de autenticación de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *       example:
 *         username: admin123
 *         password: securePassword123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           description: Mensaje de éxito
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *         accessToken:
 *           type: string
 *           description: JWT para autorización
 *         refreshToken:
 *           type: string
 *           description: Token para renovar el accessToken
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *       example:
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

const router = express.Router()

    //LOGIN
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Iniciar sesión de usuario
     *     tags: [Autenticación]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login exitoso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginResponse'
     *       401:
     *         description: Credenciales inválidas
     *       429:
     *         description: Demasiados intentos. Intente más tarde.
     */
    .post('/login', AuthController.login)

    //REFRESCAR EL TOKEN
    /**
     * @swagger
     * /auth/refresh-token:
     *   post:
     *     summary: Renovar token de acceso
     *     tags: [Autenticación]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RefreshTokenRequest'
     *     responses:
     *       200:
     *         description: Token renovado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *       401:
     *         description: Token inválido o expirado
     */
    .post('/refresh-token', AuthController.refreshToken)

export default router;