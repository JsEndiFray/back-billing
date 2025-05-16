import { validationResult } from "express-validator";
import { ErrorCodes, ParamErrorMap, sendError } from "../errors/index.js";

const errorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.debug("Validation errors:", errors.array());
        const errorList = errors.array();

        // Buscar si hay un error específico que tengamos mapeado
        for (const error of errorList) {
            const paramName = error.path || error.param;
            if (ParamErrorMap[paramName]) {
                return sendError(res, ParamErrorMap[paramName], {
                    field: paramName,
                    value: error.value
                });
            }
        }

        // Si no encontramos un error específico, devolver el mensaje genérico
        return sendError(res, ErrorCodes.GLOBAL_VALIDATION_ERROR, {
            errors: errorList
        });
    }
    next();
};

export default errorHandler;