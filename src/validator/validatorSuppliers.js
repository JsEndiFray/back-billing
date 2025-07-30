import { body, param, query } from 'express-validator';

/**
 * Validador para proveedores con documentos españoles e internacionales
 * Incluye validaciones específicas para empresas y autónomos
 */

// ==========================================
// VALIDACIONES PARA CREAR PROVEEDOR
// ==========================================
export const validateCreateSupplier = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio.')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres.'),

    body('company_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre de empresa debe tener entre 2 y 255 caracteres.'),

    /**
     * Validación exhaustiva de documentos fiscales:
     * - NIF: 8 dígitos + letra control (autónomos/personas físicas)
     * - NIE: X/Y/Z + 7 dígitos + letra control (extranjeros residentes)
     * - CIF: Letra empresa + 7 dígitos + dígito/letra control (empresas)
     * - Pasaporte: 6-9 caracteres alfanuméricos (proveedores internacionales)
     * - Tax ID extranjero: Formato flexible para proveedores internacionales
     */
    body('tax_id')
        .notEmpty()
        .withMessage('El CIF/NIF es obligatorio.')
        .isLength({ min: 8, max: 20 })
        .withMessage('El documento fiscal debe tener entre 8 y 20 caracteres.')
        .custom(value => {
            const cleanValue = value.toUpperCase().trim();

            // NIF: 8 dígitos + letra de control específica del algoritmo español
            const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

            // NIE: X/Y/Z + 7 dígitos + letra de control
            const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

            // CIF: Letra específica de tipo de empresa + 7 dígitos + control
            const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;

            // Pasaporte: Formato internacional básico
            const passportRegex = /^[A-Z0-9]{6,9}$/;

            // Tax ID europeo (para proveedores UE): Formato flexible
            const euTaxIdRegex = /^[A-Z]{2}[A-Z0-9]{6,18}$/;

            // Tax ID internacional: Formato muy flexible para otros países
            const intlTaxIdRegex = /^[A-Z0-9\-\.]{6,20}$/;

            if (!nifRegex.test(cleanValue) &&
                !nieRegex.test(cleanValue) &&
                !cifRegex.test(cleanValue) &&
                !passportRegex.test(cleanValue) &&
                !euTaxIdRegex.test(cleanValue) &&
                !intlTaxIdRegex.test(cleanValue)) {
                throw new Error('Debe ser un CIF, NIF, NIE, Tax ID europeo o documento fiscal válido.');
            }
            return true;
        }),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido.')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .custom(value => {
            if (!value) return true; // Campo opcional

            // Teléfono español: 9 dígitos
            const spanishPhoneRegex = /^[6789][0-9]{8}$/;

            // Teléfono internacional: +código país + número
            const intlPhoneRegex = /^\+[1-9]\d{7,14}$/;

            // Teléfono fijo español: 9 dígitos empezando por 8 o 9
            const landlineRegex = /^[89][0-9]{8}$/;

            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');

            if (!spanishPhoneRegex.test(cleanPhone) &&
                !intlPhoneRegex.test(cleanPhone) &&
                !landlineRegex.test(cleanPhone)) {
                throw new Error('Debe ser un teléfono español válido o internacional con código de país.');
            }
            return true;
        }),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La dirección no puede exceder 500 caracteres.'),

    body('postal_code')
        .optional()
        .trim()
        .custom(value => {
            if (!value) return true; // Campo opcional

            // Código postal español: 5 dígitos
            const spanishPostalRegex = /^[0-9]{5}$/;

            // Códigos postales internacionales: Formato flexible
            const intlPostalRegex = /^[A-Z0-9\s\-]{3,12}$/i;

            if (!spanishPostalRegex.test(value) && !intlPostalRegex.test(value)) {
                throw new Error('Debe ser un código postal válido.');
            }
            return true;
        }),

    body('city')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La ciudad debe tener entre 2 y 100 caracteres.'),

    body('province')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La provincia debe tener entre 2 y 100 caracteres.'),

    body('country')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El país debe tener entre 2 y 100 caracteres.')
        .default('España'),

    body('contact_person')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('La persona de contacto debe tener entre 2 y 255 caracteres.'),

    body('payment_terms')
        .optional()
        .isInt({ min: 0, max: 365 })
        .withMessage('Los términos de pago deben ser entre 0 y 365 días.')
        .default(30),

    body('bank_account')
        .optional()
        .trim()
        .custom(value => {
            if (!value) return true; // Campo opcional

            // IBAN español: ES + 2 dígitos control + 20 dígitos
            const ibanSpainRegex = /^ES[0-9]{22}$/;

            // IBAN europeo: 2 letras país + 2 dígitos + hasta 30 caracteres
            const ibanEuropeRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

            // Número cuenta nacional (para compatibilidad)
            const nationalAccountRegex = /^[0-9]{20}$/;

            const cleanAccount = value.replace(/[\s\-]/g, '').toUpperCase();

            if (!ibanSpainRegex.test(cleanAccount) &&
                !ibanEuropeRegex.test(cleanAccount) &&
                !nationalAccountRegex.test(cleanAccount)) {
                throw new Error('Debe ser un IBAN válido o número de cuenta de 20 dígitos.');
            }
            return true;
        }),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres.'),

    body('active')
        .optional()
        .isBoolean()
        .withMessage('El estado activo debe ser verdadero o falso.')
        .default(true)
];
/*

// ==========================================
// VALIDACIONES PARA ACTUALIZAR PROVEEDOR
// ==========================================
export const validateUpdateSupplier = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del proveedor debe ser un número entero positivo.'),

    // Mismas validaciones que crear, pero todos los campos son opcionales
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío.')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres.'),

    body('company_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre de empresa debe tener entre 2 y 255 caracteres.'),

    body('tax_id')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El CIF/NIF no puede estar vacío.')
        .isLength({ min: 8, max: 20 })
        .withMessage('El documento fiscal debe tener entre 8 y 20 caracteres.')
        .custom(value => {
            const cleanValue = value.toUpperCase().trim();
            const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
            const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
            const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
            const passportRegex = /^[A-Z0-9]{6,9}$/;
            const euTaxIdRegex = /^[A-Z]{2}[A-Z0-9]{6,18}$/;
            const intlTaxIdRegex = /^[A-Z0-9\-\.]{6,20}$/;

            if (!nifRegex.test(cleanValue) &&
                !nieRegex.test(cleanValue) &&
                !cifRegex.test(cleanValue) &&
                !passportRegex.test(cleanValue) &&
                !euTaxIdRegex.test(cleanValue) &&
                !intlTaxIdRegex.test(cleanValue)) {
                throw new Error('Debe ser un documento fiscal válido.');
            }
            return true;
        }),

    // ... resto de validaciones opcionales (como en crear)
    body('email').optional().trim().isEmail().withMessage('Debe ser un correo electrónico válido.').normalizeEmail(),
    body('payment_terms').optional().isInt({ min: 0, max: 365 }).withMessage('Los términos de pago deben ser entre 0 y 365 días.'),
    body('active').optional().isBoolean().withMessage('El estado activo debe ser verdadero o falso.')
];

// ==========================================
// VALIDACIONES PARA PARÁMETROS DE RUTA
// ==========================================
export const validateSupplierId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID del proveedor debe ser un número entero positivo.')
];

export const validateSupplierTaxId = [
    param('tax_id')
        .trim()
        .notEmpty()
        .withMessage('El CIF/NIF es obligatorio.')
        .isLength({ min: 8, max: 20 })
        .withMessage('El documento fiscal debe tener entre 8 y 20 caracteres.')
];

// ==========================================
// VALIDACIONES PARA BÚSQUEDAS
// ==========================================
export const validateSupplierSearch = [
    query('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre a buscar debe tener entre 2 y 100 caracteres.'),

    query('payment_terms')
        .optional()
        .isInt({ min: 0, max: 365 })
        .withMessage('Los términos de pago deben ser entre 0 y 365 días.'),

    query('active')
        .optional()
        .isBoolean()
        .withMessage('El filtro activo debe ser verdadero o falso.'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser entre 1 y 100.')
        .default(50),

    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El offset debe ser mayor o igual a 0.')
        .default(0)
];

// ==========================================
// VALIDACIONES PERSONALIZADAS ADICIONALES
// ==========================================

/!**
 * Valida que el CIF sea específicamente de empresa
 *!/
export const validateCompanyCIF = [
    body('tax_id')
        .custom(value => {
            const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;
            if (!cifRegex.test(value.toUpperCase())) {
                throw new Error('Debe ser un CIF de empresa válido.');
            }
            return true;
        })
];

/!**
 * Valida términos de pago estándar
 *!/
export const validateStandardPaymentTerms = [
    body('payment_terms')
        .isIn([0, 15, 30, 45, 60, 90, 120])
        .withMessage('Los términos de pago deben ser uno de: 0, 15, 30, 45, 60, 90, 120 días.')
];

/!**
 * Valida que sea proveedor español (para casos específicos)
 *!/
export const validateSpanishSupplier = [
    body('tax_id')
        .custom(value => {
            const cleanValue = value.toUpperCase().trim();
            const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
            const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
            const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;

            if (!nifRegex.test(cleanValue) && !nieRegex.test(cleanValue) && !cifRegex.test(cleanValue)) {
                throw new Error('Debe ser un documento fiscal español (NIF, NIE o CIF).');
            }
            return true;
        }),

    body('country')
        .equals('España')
        .withMessage('El país debe ser España para proveedores nacionales.')
];

/!**
 * NOTAS DE IMPLEMENTACIÓN:
 *
 * 1. Tax ID internacional: Formato flexible para diferentes países
 * 2. IBAN validation: Incluye validación básica de formato
 * 3. Términos de pago: Flexibles pero con límites razonables
 * 4. Teléfonos: Acepta formatos españoles e internacionales
 * 5. Validaciones personalizadas: Para casos de uso específicos
 *
 * USO EN CONTROLADORES:
 * import { validateCreateSupplier, validateUpdateSupplier } from '../validators/validatorSuppliers.js';
 *
 * // En el route:
 * router.post('/suppliers', validateCreateSupplier, SuppliersController.create);
 *!/*/
