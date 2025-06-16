import {body} from 'express-validator'

/**
 * Validador para clientes (particulares, autónomos y empresas)
 * Incluye validaciones de documentos españoles (DNI/NIE/CIF)
 */
export const validateClient = [
    // Tipo de cliente con valores permitidos
    body('type_client')
        .notEmpty().withMessage('El tipo de cliente es obligatorio')
        .isIn(['particular', 'autonomo', 'empresa']).withMessage('Tipo de cliente inválido'),

    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('lastname').trim().notEmpty().withMessage('El apellido es obligatorio'),

    /**
     * Nombre de empresa: obligatorio solo para type_client = 'empresa'
     */
    body('company_name')
        .trim()
        .custom((value, {req}) => {
            if (req.body.type_client === 'empresa' && (!value || value.trim() === '')) {
                throw new Error('El nombre de la compañía es obligatorio para empresas');
            }
            return true;
        }),

    /**
     * Validación de documentos de identificación españoles:
     * - DNI: 8 dígitos + letra (particulares/autónomos)
     * - NIE: X/Y/Z + 7 dígitos + letra (particulares/autónomos)
     * - CIF: Letra + 7 dígitos + dígito/letra control (empresas)
     */
    body('identification')
        .custom((value, {req}) => {
            const tipo = req.body.type_client;
            // Patrones regex para documentos españoles
            const dni = /^\d{8}[A-Z]$/i;           // 12345678A
            const nie = /^[XYZ]\d{7}[A-Z]$/i;     // X1234567L
            const cif = /^[A-Z]\d{7}[0-9A-Z]?$/i; // A12345674

            if (!value) throw new Error('La identificación es obligatoria');

            // Empresas deben usar CIF
            if (tipo === 'empresa' && !cif.test(value)) {
                throw new Error('Las empresas deben proporcionar un CIF válido');
            }

            // Particulares y autónomos usan DNI o NIE
            if ((tipo === 'particular' || tipo === 'autónomo') && !(dni.test(value) || nie.test(value))) {
                throw new Error('Los particulares/autónomos deben usar un DNI o NIE válido');
            }
            return true;
        }),

    // Teléfono español (9 dígitos)
    body('phone').notEmpty()
        .withMessage('El teléfono es obligatorio')
        .isLength({min: 9, max: 9}).withMessage('El teléfono debe tener exactamente 9 dígitos')
        .isNumeric().withMessage('El teléfono solo debe contener números'),

    body('email').notEmpty().withMessage('El correo electrónico es obligatorio.')
        .isEmail().withMessage('Debe ser un correo electrónico válido.'),

    body('address').trim().notEmpty().withMessage('La dirección es obligatorio'),
    body('postal_code').notEmpty().withMessage('El código postal es obligatorio').isPostalCode('ES'),
    body('location').trim().notEmpty().withMessage('La localidad es obligatorio'),
    body('province').trim().notEmpty().withMessage('La provincia es obligatorio'),
    body('country').trim().notEmpty().withMessage('El país es obligatorio.'),

    /**
     * Campos para relación empresa-administrador:
     * - parent_company_id: ID de empresa padre (solo para autónomos administradores)
     * - relationship_type: Tipo de relación (actualmente solo 'administrator')
     */
    body('parent_company_id')
        .optional({nullable: true, checkFalsy: true})
        .custom((value) => {
            if (value !== null && value !== undefined && value !== '' && !Number.isInteger(Number(value))) {
                throw new Error('El ID de empresa padre debe ser numérico');
            }
            return true;
        }),

    body('relationship_type')
        .optional({nullable: true, checkFalsy: true})
        .custom((value) => {
            if (value !== null && value !== undefined && value !== '' && !['administrator'].includes(value)) {
                throw new Error('Tipo de relación inválido');
            }
            return true;
        }),
];

/**
 * NOTA: Los regex de DNI/NIE/CIF validan solo formato, no dígito de control
 * Para validación completa del dígito de control, usar librerías especializadas
 */