import UserService from "../services/usersServices.js";
import { ErrorMessage } from "../helpers/msgError.js";

export default class AuthController {

    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: ErrorMessage.GLOBAL.ERROR_VALIDATE });
        }

        const token = await UserService.login(username, password);

        if (!token) {
            return res.status(401).json({ msg: ErrorMessage.USERS.INVALID_CREDENTIALS });
        }

        return res.status(200).json({ msg: ErrorMessage.USERS.LOGIN, token });
    }
}