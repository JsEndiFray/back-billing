import { body } from 'express-validator';

export const validateCreateEstateOwner = [
    body('estate_id')
        .notEmpty().withMessage('El ID del inmueble es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID del inmueble debe ser un entero positivo'),

    body('owner_id')
        .notEmpty().withMessage('El ID del propietario es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo'),

    body('ownership_percentage')
        .notEmpty().withMessage('El porcentaje de propiedad es obligatorio')
        .isFloat({ min: 0.01, max: 100 }).withMessage('El porcentaje debe estar entre 0.01 y 100'),
];

export const validateUpdateEstateOwner = [
    body('ownership_percentage')
        .notEmpty().withMessage('El porcentaje de propiedad es obligatorio')
        .isFloat({ min: 0.01, max: 100 }).withMessage('El porcentaje debe estar entre 0.01 y 100'),
];
