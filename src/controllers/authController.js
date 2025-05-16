import UserService from "../services/usersServices.js";
import { ErrorCodes, sendError, sendSuccess, ErrorMessages } from "../errors/index.js";

export default class AuthController {

    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return sendError(res, ErrorCodes.GLOBAL_VALIDATION_ERROR);
        }

        const result = await UserService.login(username, password);

        if (!result) {
            return sendError(res, ErrorCodes.USER_CREDENTIALS_INVALID);
        }

        return sendSuccess(res, ErrorMessages[ErrorCodes.USER_LOGIN], {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    }

    // Método para renovar tokens
    static async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return sendError(res, ErrorCodes.GLOBAL_VALIDATION_ERROR);
        }

        const tokens = await UserService.refreshToken(refreshToken);

        if (!tokens) {
            return sendError(res, ErrorCodes.USER_TOKEN_EXPIRED);
        }

        return sendSuccess(res, ErrorMessages[ErrorCodes.USER_RENOVATE_TOKEN], {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
}