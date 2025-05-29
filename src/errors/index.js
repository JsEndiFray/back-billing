import { ErrorCodes, ErrorMessages, ErrorHttpCodes } from './errorCodes.js';

// Mapeo de parámetros de validación a códigos de error
export const ParamErrorMap = {
    'email': ErrorCodes.USER_EMAIL_INVALID,
    'phone': ErrorCodes.USER_PHONE_INVALID,
    'username': ErrorCodes.USER_DUPLICATE,
    'nif': ErrorCodes.CLIENT_ID_REQUIRED,
    'clientName': ErrorCodes.CLIENT_NAME_REQUIRED,
    'referenceCadastral': ErrorCodes.ESTATE_REFERENCE_REQUIRED
};

// Para mantener compatibilidad con código existente
export const ErrorMessage = {
    GLOBAL: {
        NO_DATA: ErrorMessages[ErrorCodes.GLOBAL_NOT_FOUND],
        DATA: ErrorMessages[ErrorCodes.GLOBAL_DATA],
        INTERNAL: ErrorMessages[ErrorCodes.GLOBAL_SERVER_ERROR],
        INVALID_ID: ErrorMessages[ErrorCodes.GLOBAL_INVALID_ID],
        SEARCH_ERROR: ErrorMessages[ErrorCodes.GLOBAL_SEARCH_ERROR],
        ERROR_UPDATE: ErrorMessages[ErrorCodes.GLOBAL_ERROR_UPDATE],
        ERROR_DELETE: ErrorMessages[ErrorCodes.GLOBAL_ERROR_DELETE],
        ERROR_CREATE: ErrorMessages[ErrorCodes.GLOBAL_ERROR_CREATE],
        UNAUTHORIZED: ErrorMessages[ErrorCodes.GLOBAL_UNAUTHORIZED],
        CREATE: ErrorMessages[ErrorCodes.GLOBAL_CREATE],
        UPDATE: ErrorMessages[ErrorCodes.GLOBAL_UPDATE],
        DELETE: ErrorMessages[ErrorCodes.GLOBAL_DELETE],
        NOT_FOUND: ErrorMessages[ErrorCodes.GLOBAL_NOT_FOUND],
        ERROR_VALIDATE: ErrorMessages[ErrorCodes.GLOBAL_VALIDATION_ERROR],
    },
    BILLS: {
        NOT_FOUND: ErrorMessages[ErrorCodes.BILL_NOT_FOUND],
        DUPLICATE: ErrorMessages[ErrorCodes.BILL_DUPLICATE],
        ERROR_CREATE: ErrorMessages[ErrorCodes.BILL_CREATE_ERROR],
        ERROR_GENERATE_PDF: ErrorMessages[ErrorCodes.BILL_PDF_ERROR],
        NOT_ABONO: ErrorMessages[ErrorCodes.BILL_ABONO_NOT_FOUND],
        ID_FACTURA_REQUIRED: ErrorMessages[ErrorCodes.BILL_ID_REQUIRED],
        ERROR_ABONO: ErrorMessages[ErrorCodes.BILL_ABONO_ERROR],
        ABONO_OK: ErrorMessages[ErrorCodes.BILL_ABONO_OK],
    },
    CLIENTS: {
        TYPE: ErrorMessages[ErrorCodes.CLIENT_TYPE],
        NOT_FOUND: ErrorMessages[ErrorCodes.CLIENT_NOT_FOUND],
        DUPLICATE: ErrorMessages[ErrorCodes.CLIENT_DUPLICATE],
        INVALID_COMPANY: ErrorMessages[ErrorCodes.CLIENT_INVALID_COMPANY],
        NAME_REQUIRED: ErrorMessages[ErrorCodes.CLIENT_NAME_REQUIRED],
        NAME_LASTNAME_REQUIRED: ErrorMessages[ErrorCodes.CLIENT_NAME_LASTNAME_REQUIRED],
        ID_REQUIRED: ErrorMessages[ErrorCodes.CLIENT_ID_REQUIRED],
        NOT_ADMIN: ErrorMessages[ErrorCodes.CLIENT_NOT_ADMIN],
        COMPANIES_NOT_FOUND: ErrorMessages[ErrorCodes.CLIENT_COMPANIES_NOT_FOUND],
        HAS_BILLS: ErrorMessages[ErrorCodes.CLIENT_HAS_BILLS],
        HAS_ADMINISTRATORS: ErrorMessages[ErrorCodes.CLIENT_HAS_ADMINISTRATORS],
        IS_ADMINISTRATOR: ErrorMessages[ErrorCodes.CLIENT_IS_ADMINISTRATOR],
    },
    ESTATES: {
        NOT_FOUND: ErrorMessages[ErrorCodes.ESTATE_NOT_FOUND],
        DUPLICATE: ErrorMessages[ErrorCodes.ESTATE_DUPLICATE],
        REFERENCE_CADASTRAL: ErrorMessages[ErrorCodes.ESTATE_REFERENCE_REQUIRED],
    },
    ESTATE_OWNERS: {
        DUPLICATE: ErrorMessages[ErrorCodes.ESTATE_OWNER_DUPLICATE],
    },
    OWNERS: {
        DUPLICATE: ErrorMessages[ErrorCodes.OWNER_DUPLICATE],
        NOT_FOUND: ErrorMessages[ErrorCodes.OWNER_NOT_FOUND],
    },

    USERS: {
        INVALID_CREDENTIALS: ErrorMessages[ErrorCodes.USER_CREDENTIALS_INVALID],
        LOGIN: ErrorMessages[ErrorCodes.USER_LOGIN],
        INVALID_TOKEN: ErrorMessages[ErrorCodes.USER_TOKEN_EXPIRED],
        RENOVATE_TOKEN: ErrorMessages[ErrorCodes.USER_RENOVATE_TOKEN],
        DUPLICATE: ErrorMessages[ErrorCodes.USER_DUPLICATE],
        EMAIL_ERROR: ErrorMessages[ErrorCodes.USER_EMAIL_INVALID],
        NUMBER_ERROR: ErrorMessages[ErrorCodes.USER_PHONE_INVALID],
    },

};

/**
 * Función para enviar una respuesta de error
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} errorCode - Código de error
 * @param {Object} extras - Datos adicionales para incluir en la respuesta
 * @returns {Object} Respuesta HTTP
 */
export function sendError(res, errorCode, extras = {}) {
    // Obtener el código HTTP correspondiente o usar 500 por defecto
    const httpCode = ErrorHttpCodes[errorCode] || 500;

    return res.status(httpCode).json({
        errorCode: errorCode,
        msg: ErrorMessages[errorCode],
        ...extras
    });
}

/**
 * Función para enviar una respuesta exitosa
 * @param {Object} res - Objeto de respuesta Express
 * @param {string} message - Mensaje de éxito
 * @param {Object} data - Datos a incluir en la respuesta
 * @param {number} status - Código HTTP (opcional, por defecto 200)
 * @returns {Object} Respuesta HTTP
 */
export function sendSuccess(res, message, data = {}, status = 200) {
    return res.status(status).json({
        msg: message,
        data: data
    });
}

// Exportar todo lo necesario
export { ErrorCodes, ErrorMessages, ErrorHttpCodes };