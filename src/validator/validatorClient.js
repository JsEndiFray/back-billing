import {body} from 'express-validator'

export const validateClient = [
    body('type_client')
        .notEmpty().withMessage('El tipo de cliente es obligatorio')
        .isIn(['particular', 'autónomo', 'empresa']).withMessage('Tipo de cliente inválido'),
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('lastname').notEmpty().withMessage('El apellido es obligatorio'),
    body('company_name')
        .custom((value, {req}) => {
            if (req.body.type_client === 'empresa' && (!value || value.trim() === '')) {
                throw new Error('El nombre de la compañía es obligatorio para empresas');
            }
            return true;
        }),
    body('identification')
        .custom((value, {req}) => {
            const tipo = req.body.type_client;
            const dni = /^\d{8}[A-Z]$/i;
            const nie = /^[XYZ]\d{7}[A-Z]$/i;
            const cif = /^[A-Z]\d{7}[0-9A-Z]?$/i;
            if (!value) throw new Error('La identificación es obligatoria');
            if (tipo === 'empresa' && !cif.test(value)) {
                throw new Error('Las empresas deben proporcionar un CIF válido');
            }
            if ((tipo === 'particular' || tipo === 'autónomo') && !(dni.test(value) || nie.test(value))) {
                throw new Error('Los particulares/autónomos deben usar un DNI o NIE válido');
            }
            return true;
        }),
    body('address').notEmpty().withMessage('La dirección es obligatorio'),
    body('postal_code').notEmpty().withMessage('El código postal es obligatorio'),
    body('location').notEmpty().withMessage('La localidad es obligatorio'),
    body('province').notEmpty().withMessage('La provincia es obligatorio'),
];