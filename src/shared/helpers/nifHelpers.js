/**
 * Valida si un documento de identidad español es válido en formato
 *
 * Soporta los siguientes tipos de documentos:
 * - NIF: 8 dígitos + 1 letra (ej: 12345678Z)
 * - NIE: X/Y/Z + 7 dígitos + 1 letra (ej: X1234567L)
 * - CIF: 1 letra + 7 dígitos + 1 dígito/letra (ej: A12345674)
 *
 * @param {string} id - Documento de identidad a validar
 * @returns {boolean} true si el formato es válido, false en caso contrario
 *
 * @example
 * // NIF válido
 * console.log(validate("12345678Z")); // true
 *
 * @example
 * // NIE válido
 * console.log(validate("X1234567L")); // true
 *
 * @example
 * // CIF válido
 * console.log(validate("A12345674")); // true
 *
 * @example
 * // Formatos inválidos
 * console.log(validate("123456789")); // false - faltan letras
 * console.log(validate("12345678ZZ")); // false - demasiadas letras
 * console.log(validate("")); // false - string vacío
 * console.log(validate(null)); // false - valor nulo
 *
 * @example
 * // Maneja espacios y convierte a mayúsculas automáticamente
 * console.log(validate(" 12345678z ")); // true
 * console.log(validate("x1234567l")); // true
 *
 * @note Esta función solo valida el FORMATO, no verifica el dígito de control
 * @since 1.0.0
 * @author Tu Nombre
 */
export const validate = (id) => {
    // Validación de entrada: debe ser un string no vacío
    if (!id || typeof id !== 'string' || id.trim().length === 0) return false;

    // Normaliza el input: elimina espacios y convierte a mayúsculas
    const cleanId = id.trim().toUpperCase();

    // Patrones regex para cada tipo de documento
    const nifRegex = /^[0-9]{8}[A-Z]$/;           // 8 números + 1 letra
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;     // X/Y/Z + 7 números + 1 letra
    const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/; // Letra empresa + 7 números + dígito/letra control

    // Verifica si coincide con alguno de los patrones
    return nifRegex.test(cleanId) || nieRegex.test(cleanId) || cifRegex.test(cleanId);
};