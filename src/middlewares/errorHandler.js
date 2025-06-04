import { validationResult } from "express-validator";

// Mapeo de parámetros a mensajes de error específicos
const ParamErrorMessages = {
    'email': 'Email inválido',
    'phone': 'Teléfono inválido',
    'username': 'Nombre de usuario duplicado',
    'nif': 'Identificación requerida',
    'clientName': 'Nombre de cliente requerido',
    'referenceCadastral': 'Referencia catastral requerida'
};

// Mapeo de parámetros a códigos de estado HTTP
const ParamHttpCodes = {
    'email': 400,
    'phone': 400,
    'username': 409, // Conflicto por duplicado
    'nif': 400,
    'clientName': 400,
    'referenceCadastral': 400
};

const errorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.debug("Validation errors:", errors.array());
        const errorList = errors.array();

        // Buscar si hay un error específico que tengamos mapeado
        for (const error of errorList) {
            const paramName = error.path || error.param;

            if (ParamErrorMessages[paramName]) {
                const statusCode = ParamHttpCodes[paramName] || 400;
                return res.status(statusCode).json(ParamErrorMessages[paramName]);
            }
        }

        // Si no encontramos un error específico, devolver mensaje genérico
        return res.status(400).json("Error de validación");
    }
    next();
};

export default errorHandler;