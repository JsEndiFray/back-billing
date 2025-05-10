import UserService from "../services/usersServices.js";
import { ErrorMessage } from "../helpers/msgError.js";

export default class AuthController {

    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: ErrorMessage.GLOBAL.ERROR_VALIDATE });
        }

        const result = await UserService.login(username, password);

        if (!result) {
            return res.status(401).json({ msg: ErrorMessage.USERS.INVALID_CREDENTIALS });
        }

        return res.status(200).json({
            msg: ErrorMessage.USERS.LOGIN,
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    }

    // Método para renovar tokens
    static async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ msg: ErrorMessage.GLOBAL.ERROR_VALIDATE });
        }

        const tokens = await UserService.refreshToken(refreshToken);

        if (!tokens) {
            return res.status(401).json({ msg: ErrorMessage.USERS.INVALID_TOKEN });
        }

        return res.status(200).json({
            msg: ErrorMessage.USERS.RENOVATE_TOKEN,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
}