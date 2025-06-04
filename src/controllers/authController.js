import UserService from "../services/usersServices.js";

export default class AuthController {

    static async login(req, res) {
        const { username, password } = req.body;

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
    }

    // Método para renovar tokens
    static async refreshToken(req, res) {
        const { refreshToken } = req.body;

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
    }
}