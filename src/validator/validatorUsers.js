import {body} from "express-validator";

export const validateUser = [
    body('username')
        .notEmpty().withMessage('El username es obligatorio')
        .isLength({ min: 3 }).withMessage('El username debe tener al menos 3 caracteres'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email no es válido'),
    body('phone')
        .notEmpty().withMessage('El teléfono es obligatorio')
        .isLength({ min: 9, max: 9 }).withMessage('El teléfono debe tener exactamente 9 dígitos')
        .isNumeric().withMessage('El teléfono solo debe contener números'),
    body('role')
        .notEmpty().withMessage('El rol es obligatorio')
        .isIn(['admin', 'employee']).withMessage('El rol debe ser admin o employee'),
];