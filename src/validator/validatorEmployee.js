import {body} from 'express-validator';

/**
 * Validador para empleados con documentos españoles e internacionales
 */
export const validaEmployee = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('lastname').trim().notEmpty().withMessage('El apellido es obligatorio.'),
    body('email').notEmpty().withMessage('El correo electrónico es obligatorio.')
        .isEmail().withMessage('Debe ser un correo electrónico válido.'),

    /**
     * Validación exhaustiva de documentos de identificación:
     * - NIF: 8 dígitos + letra control específica (españoles)
     * - NIE: X/Y/Z + 7 dígitos + letra control (extranjeros residentes)
     * - Pasaporte: 6-9 caracteres alfanuméricos (internacional)
     */
    body('identification')
        .notEmpty().withMessage('La identificación es obligatoria.')
        .isLength({min: 8, max: 9}).withMessage('La identificación debe tener entre 8 y 9 caracteres.')
        .custom(value => {
            // NIF: 8 dígitos + letra de control específica del algoritmo español
            const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

            // NIE: X/Y/Z + 7 dígitos + letra de control
            const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;

            // Pasaporte: Formato internacional básico
            const passportRegex = /^[A-Z0-9]{6,9}$/;

            const cleanValue = value.toUpperCase();

            if (!nifRegex.test(cleanValue) &&
                !nieRegex.test(cleanValue) &&
                !passportRegex.test(cleanValue)) {
                throw new Error('Debe ser un NIF, NIE o Pasaporte válido.');
            }
            return true;
        }),

    // Teléfono español (9 dígitos)
    body('phone').notEmpty()
        .withMessage('El teléfono es obligatorio')
        .isLength({min: 9, max: 9}).withMessage('El teléfono debe tener exactamente 9 dígitos')
        .isNumeric().withMessage('El teléfono solo debe contener números'),

    body('address').trim().notEmpty().withMessage('La dirección es obligatoria.'),
    body('postal_code').notEmpty().isPostalCode('ES').withMessage('El código postal es obligatorio y debe ser válido.'),
    body('location').trim().notEmpty().withMessage('La localidad es obligatoria.'),
    body('province').trim().notEmpty().withMessage('La provincia es obligatoria.'),
    body('country').trim().notEmpty().withMessage('El país es obligatorio.')
];

/**
 * NOTA: Las letras de control en NIF/NIE siguen el algoritmo oficial español.
 * El regex valida formato pero no calcula el dígito de control real.
 */