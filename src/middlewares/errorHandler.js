import { validationResult } from "express-validator";
import {ErrorMessage} from "../helpers/msgError.js";

const errorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.debug("Validation errors:", errors.array());
        return res.status(400).json({
            msg: ErrorMessage.GLOBAL.ERROR_VALIDATE,
            errors: errors.array()
        });
    }
    next();
};

export default errorHandler;