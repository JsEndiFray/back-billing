import { body } from 'express-validator';
import {
    validateCatastralReference,
    normalizeCatastralReference
} from '../shared/helpers/catastralHelpers.js';

/**
 * Validador para propiedades inmobiliarias
 */
export const validateEstate = [
    /**
     * Referencia catastral española: 20 caracteres alfanuméricos
     * Validación completa con algoritmo de dígitos de control
     */
    body('cadastral_reference')
        .notEmpty()
        .withMessage('La referencia catastral es obligatoria')
        .isLength({ min: 20, max: 20 })
        .withMessage('La referencia catastral debe tener exactamente 20 caracteres')
        .matches(/^[0-9A-Z\s]{20,}$/i)
        .withMessage('La referencia catastral solo puede contener números, letras y espacios')
        .custom((value) => {
            if (!validateCatastralReference(value)) {
                throw new Error('La referencia catastral no es válida según el algoritmo oficial español');
            }
            return true;
        })
        .customSanitizer(normalizeCatastralReference),

    body('price')
        .notEmpty()
        .withMessage('El precio es obligatorio.')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El precio debe ser un número decimal válido.')
        .custom((value) => {
            if (parseFloat(value) <= 0) {
                throw new Error('El precio debe ser mayor que 0');
            }
            return true;
        }),

    body('address')
        .notEmpty()
        .withMessage('La dirección es obligatoria.')
        .isLength({ min: 5, max: 255 })
        .withMessage('La dirección debe tener entre 5 y 255 caracteres.')
        .trim(),

    body('postal_code')
        .notEmpty()
        .withMessage('El código postal es obligatorio.')
        .isPostalCode('ES')
        .withMessage('El código postal debe ser válido en España (formato: 12345).'),

    body('location')
        .notEmpty()
        .withMessage('La localidad es obligatoria.')
        .isLength({ min: 2, max: 100 })
        .withMessage('La localidad debe tener entre 2 y 100 caracteres.')
        .trim(),

    body('province')
        .notEmpty()
        .withMessage('La provincia es obligatoria.')
        .isLength({ min: 2, max: 50 })
        .withMessage('La provincia debe tener entre 2 y 50 caracteres.')
        .trim(),

    body('surface')
        .notEmpty()
        .withMessage('La superficie es obligatoria.')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('La superficie debe ser un número decimal válido.')
        .custom((value) => {
            if (parseFloat(value) <= 0) {
                throw new Error('La superficie debe ser mayor que 0');
            }
            return true;
        })
];