/**
 * VALIDADOR DE REFERENCIA CATASTRAL ESPAÑOLA - ALGORITMO OFICIAL
 *
 * Basado en el algoritmo oficial de la Dirección General del Catastro
 * Fuente: Documentación oficial del Ministerio de Hacienda
 */

/**
 * Valida una referencia catastral española usando el algoritmo oficial
 * @param {string} referenciaCatastral - Referencia catastral de 20 caracteres
 * @returns {number} - 1: válida, 0: dígitos control incorrectos, -1: formato incorrecto
 */
const validarReferenciaCatastralOficial = (referenciaCatastral) => {
    // Pesos oficiales para cada posición
    const pesoPosicion = [13, 15, 12, 5, 4, 17, 9, 21, 3, 7, 1];
    // Tabla oficial de letras de control
    const letraDc = 'MQWERTYUIOPASDFGHJKLBZX';

    // Verificar formato básico
    if (!referenciaCatastral || referenciaCatastral.length !== 20) {
        return -1;
    }

    // Normalizar a mayúsculas
    referenciaCatastral = referenciaCatastral.toUpperCase();

    // Verificar que solo contenga caracteres alfanuméricos
    if (!/^[0-9A-Z]{20}$/.test(referenciaCatastral)) {
        return -1;
    }

    // Extraer subcadenas para cálculo de dígitos de control
    const cadenaPrimerDC = referenciaCatastral.substring(0, 7) + referenciaCatastral.substring(14, 18);
    const cadenaSegundoDC = referenciaCatastral.substring(7, 14) + referenciaCatastral.substring(14, 18);

    const cadenasDC = [cadenaPrimerDC, cadenaSegundoDC];
    let dcCalculado = '';

    // Calcular cada dígito de control
    cadenasDC.forEach((cadena) => {
        let sumaDigitos = 0;

        cadena.split('').forEach((caracter, posicion) => {
            let valorCaracter;

            // Convertir carácter a valor numérico según algoritmo oficial
            if (caracter >= 'A' && caracter <= 'N') {
                valorCaracter = caracter.charCodeAt(0) - 64; // A=1, B=2, ..., N=14
            } else if (caracter === 'Ñ') {
                valorCaracter = 15;
            } else if (caracter > 'N') {
                valorCaracter = caracter.charCodeAt(0) - 63; // O=15, P=16, ..., Z=27
            } else {
                // Es un dígito
                valorCaracter = parseInt(caracter);
            }

            // Aplicar fórmula oficial
            sumaDigitos = (sumaDigitos + (valorCaracter * pesoPosicion[posicion])) % 23;
        });

        // Obtener letra de control correspondiente
        dcCalculado += letraDc.charAt(sumaDigitos);
    });

    // Verificar si los dígitos calculados coinciden con los proporcionados
    const digitosOriginales = referenciaCatastral.substring(18, 20);
    if (dcCalculado !== digitosOriginales) {
        return 0; // Dígitos de control incorrectos
    }

    return 1; // Válida
};

/**
 * Valida una referencia catastral española (interfaz simplificada)
 * @param {string} catastralRef - Referencia catastral de 20 caracteres
 * @returns {boolean} - true si es válida
 */
export const validateCatastralReference = (catastralRef) => {
    if (!catastralRef || typeof catastralRef !== 'string') {
        return false;
    }

    // Limpiar espacios
    const cleanRef = catastralRef.replace(/\s/g, '').toUpperCase();

    // Usar algoritmo oficial
    const resultado = validarReferenciaCatastralOficial(cleanRef);

    return resultado === 1;
};

/**
 * Normaliza una referencia catastral (elimina espacios, convierte a mayúsculas)
 * @param {string} catastralRef - Referencia catastral
 * @returns {string} - Referencia normalizada
 */
export const normalizeCatastralReference = (catastralRef) => {
    if (!catastralRef || typeof catastralRef !== 'string') {
        return '';
    }
    return catastralRef.replace(/\s/g, '').toUpperCase();
};

/**
 * Obtiene información detallada de una referencia catastral
 * @param {string} catastralRef - Referencia catastral válida
 * @returns {object|null} - Información extraída o null si inválida
 */
export const parseCatastralReference = (catastralRef) => {
    if (!validateCatastralReference(catastralRef)) {
        return null;
    }

    const cleanRef = normalizeCatastralReference(catastralRef);

    return {
        full: cleanRef,
        firstPart: cleanRef.substring(0, 7),           // Identificador de finca/parcela
        secondPart: cleanRef.substring(7, 14),         // Hoja del plano
        controlDigits: cleanRef.substring(14, 16),     // Identificador dentro de finca
        municipalCode: cleanRef.substring(16, 18),     // Código municipal
        provinceCode: cleanRef.substring(18, 20),      // Dígitos de control
        isValid: true
    };
};

/**
 * Valida referencia catastral con información detallada del resultado
 * @param {string} catastralRef - Referencia catastral
 * @returns {object} - Resultado detallado de la validación
 */
export const validateCatastralReferenceDetailed = (catastralRef) => {
    if (!catastralRef || typeof catastralRef !== 'string') {
        return {
            valid: false,
            error: 'Referencia catastral no proporcionada',
            code: -1
        };
    }

    const cleanRef = catastralRef.replace(/\s/g, '').toUpperCase();
    const resultado = validarReferenciaCatastralOficial(cleanRef);

    switch (resultado) {
        case 1:
            return {
                valid: true,
                reference: cleanRef,
                message: 'Referencia catastral válida'
            };
        case 0:
            return {
                valid: false,
                error: 'Dígitos de control incorrectos',
                code: 0
            };
        case -1:
            return {
                valid: false,
                error: 'Formato incorrecto (debe tener 20 caracteres alfanuméricos)',
                code: -1
            };
        default:
            return {
                valid: false,
                error: 'Error desconocido',
                code: -2
            };
    }
};

// ========================================
// 📚 INFORMACIÓN DEL ALGORITMO OFICIAL:
// ========================================

/**
 * ALGORITMO OFICIAL DE LA DIRECCIÓN GENERAL DEL CATASTRO
 *
 * 🎯 ESTRUCTURA DE REFERENCIA CATASTRAL (20 caracteres):
 * - Posiciones 1-7: Identificador de finca/parcela
 * - Posiciones 8-14: Hoja del plano donde se ubica
 * - Posiciones 15-18: Identificador del inmueble dentro de la finca
 * - Posiciones 19-20: Dígitos de control (calculados)
 *
 * 🧮 CÁLCULO DE DÍGITOS DE CONTROL:
 * 1. Se crean dos subcadenas:
 *    - Primera: pos 1-7 + pos 15-18
 *    - Segunda: pos 8-14 + pos 15-18
 *
 * 2. Para cada subcadena:
 *    - Convertir caracteres: A=1, B=2, ..., N=14, Ñ=15, O=15, P=16, ..., Z=27
 *    - Multiplicar por pesos: [13,15,12,5,4,17,9,21,3,7,1]
 *    - Sumar y aplicar módulo 23
 *    - Convertir resultado a letra usando: 'MQWERTYUIOPASDFGHJKLBZX'
 *
 * 3. Los dos caracteres resultantes son los dígitos de control
 *
 * ✅ REFERENCIAS VÁLIDAS: Solo las matemáticamente correctas según este algoritmo
 * ❌ REFERENCIAS INVÁLIDAS: Cualquiera que no pase la verificación matemática
 *
 * 📖 FUENTE: Algoritmo oficial del Ministerio de Hacienda - Dirección General del Catastro
 */