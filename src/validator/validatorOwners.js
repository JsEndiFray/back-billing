import { body } from 'express-validator';

export const validateOwners = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('lastname').trim().notEmpty().withMessage('El apellido es obligatorio.'),
    body('email').notEmpty().withMessage('El correo electrónico es obligatorio.')
        .isEmail().withMessage('Debe ser un correo electrónico válido.'),
    body('nif')
        .notEmpty().withMessage('El NIF es obligatorio.')
        .isLength({ min: 9, max: 9 }).withMessage('El NIF debe tener exactamente 9 caracteres.')
        .custom(value => {
            const nifRegex = /^[0-9]{8}[A-Za-z]$/i;
            if (!nifRegex.test(value)) {
                throw new Error('El NIF no es válido. Debe tener 8 números y una letra.');
            }
            return true;
        }),
    body('address').trim().notEmpty().withMessage('La dirección es obligatoria.'),
    body('postal_code').notEmpty().isPostalCode('ES').withMessage('El código postal es obligatorio y debe ser válido.'),
    body('location').trim().notEmpty().withMessage('La localidad es obligatoria.'),
    body('province').trim().notEmpty().withMessage('La provincia es obligatoria.')
];