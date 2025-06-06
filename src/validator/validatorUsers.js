import {body} from "express-validator";

export const validateUser = [
    body('username').notEmpty().withMessage('El username es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('email').notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email no es válido'),
    body('phone').notEmpty()
        .withMessage('El teléfono es obligatorio')
        .isLength({min: 9, max: 9}).withMessage('El teléfono debe tener exactamente 9 dígitos')
        .isNumeric().withMessage('El teléfono solo debe contener números'),
    body('role').notEmpty().withMessage('El rol es obligatorio')
        .isIn(['admin', 'employee']).withMessage('El rol debe ser admin o employee')
];