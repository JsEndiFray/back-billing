/**
 * Error operativo de la aplicación.
 *
 * Distingue errores esperados (NOT_FOUND, DUPLICATE, validaciones de negocio)
 * de errores de programación (TypeError, ReferenceError, fallos de DB).
 *
 * El error handler global inspecciona isOperational para decidir si revelar
 * el statusCode y mensaje al cliente, o devolver un 500 genérico.
 */
export class AppError extends Error {
    /**
     * @param {string} message    - Mensaje seguro para el cliente
     * @param {number} statusCode - Código HTTP (400, 404, 409, 422, 500…)
     * @param {string} [errorCode]  - Código de error legible por máquina (ej: 'USER_NOT_FOUND')
     * @param {object} [details]    - Metadatos adicionales para logging (nunca expuestos al cliente)
     */
    constructor(message, statusCode, errorCode = null, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errorCode = errorCode;
        this.details = details;
        // Mantiene el stack trace limpio (excluye el constructor de la traza)
        Error.captureStackTrace(this, this.constructor);
    }
}
