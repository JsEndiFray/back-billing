import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router()
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Iniciar sesión de usuario
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login exitoso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 msg:
     *                   type: string
     *                 user:
     *                   type: object
     *                 accessToken:
     *                   type: string
     *                 refreshToken:
     *                   type: string
     *       401:
     *         description: Credenciales inválidas
     */
    .post('/login', AuthController.login)
    //Nueva ruta para renovar tokens
    .post('/refresh-token', AuthController.refreshToken)

export default router;