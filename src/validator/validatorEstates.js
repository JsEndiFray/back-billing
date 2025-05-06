import { body } from 'express-validator';

export const validateEstate = [
    body('cadastral_reference')
        .notEmpty().withMessage('La referencia catastral es obligatoria')
        .isLength({ min: 20, max: 20 }).withMessage('La referencia catastral debe tener 20 caracteres')
        .matches(/^[0-9A-Z]{20}$/i).withMessage('Formato de referencia catastral inválido'),

    body('price')
        .notEmpty().withMessage('El precio es obligatorio.')
        .isDecimal().withMessage('El precio debe ser un número decimal.'),

    body('address')
        .notEmpty().withMessage('La dirección es obligatoria.')
        .trim(),

    body('postal_code')
        .notEmpty().withMessage('El código postal es obligatorio.')
        .isPostalCode('ES').withMessage('El código postal debe ser válido en España.'),

    body('location')
        .notEmpty().withMessage('La localidad es obligatoria.')
        .trim(),

    body('province')
        .notEmpty().withMessage('La provincia es obligatoria.')
        .trim(),

    body('surface')
        .notEmpty().withMessage('La superficie es obligatoria.')
        .isDecimal().withMessage('La superficie debe ser un número decimal.')
];