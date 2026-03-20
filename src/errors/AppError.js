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
     * @param {string} message  - Mensaje seguro para el cliente
     * @param {number} statusCode - Código HTTP (400, 404, 409, 422, 500…)
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        // Mantiene el stack trace limpio (excluye el constructor de la traza)
        Error.captureStackTrace(this, this.constructor);
    }
}
