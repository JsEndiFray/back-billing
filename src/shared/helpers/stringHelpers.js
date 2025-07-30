/**
 * Sanitiza una cadena de texto eliminando espacios y convirtiendo a minúsculas
 *
 * Normaliza strings para comparaciones consistentes, búsquedas y
 * almacenamiento de datos. Es útil para emails, nombres de usuario,
 * categorías, tags, etc.
 *
 * @param {string} value - Cadena de texto a sanitizar
 * @returns {string} String sanitizado (sin espacios laterales y en minúsculas)
 *                   Retorna string vacío si el input es inválido
 *
 * @example
 * // Sanitización básica
 * console.log(sanitizeString("  HOLA MUNDO  ")); // "hola mundo"
 *
 * @example
 * // Útil para emails
 * console.log(sanitizeString("  USER@EXAMPLE.COM  ")); // "user@example.com"
 *
 * @example
 * // Manejo de valores inválidos
 * console.log(sanitizeString(null)); // ""
 * console.log(sanitizeString(undefined)); // ""
 * console.log(sanitizeString("")); // ""
 * console.log(sanitizeString("   ")); // ""
 *
 * @example
 * // Casos de uso típicos
 * const userEmail = sanitizeString(inputEmail);
 * const searchTerm = sanitizeString(userSearch);
 * const category = sanitizeString(selectedCategory);
 *
 * @note Esta función es idempotente: aplicarla múltiples veces da el mismo resultado
 * @since 1.0.0
 * @author Tu Nombre
 */
//verifica los espacios y mayúsculas y minúsculas
export function sanitizeString(value) {
    // Validación de entrada: debe ser un string
    if(!value || typeof value !== 'string') return '';

    // Elimina espacios al inicio y final, luego convierte a minúsculas
    return value.trim().toLowerCase();
}