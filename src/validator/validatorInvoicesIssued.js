import { body } from 'express-validator';

/**
 * Validador para facturas emitidas a clientes
 * Incluye validaciones fiscales específicas para el sistema español de IVA repercutido
 * Gestiona cobros, facturación proporcional y sistema de abonos
 */
export const validateCreateInvoiceIssued = [
    // ==========================================
    // DATOS BÁSICOS DE LA FACTURA
    // ==========================================

    body('invoice_number')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('El número de factura debe tener entre 1 y 100 caracteres.')
        .matches(/^[A-Z0-9\-\/\s]+$/i)
        .withMessage('El número de factura solo puede contener letras, números, guiones y barras.'),

    body('clients_id')
        .notEmpty()
        .withMessage('El cliente es obligatorio.')
        .isInt({ min: 1 })
        .withMessage('El cliente debe ser un ID válido.'),

    body('owners_id')
        .notEmpty()
        .withMessage('El propietario es obligatorio.')
        .isInt({ min: 1 })
        .withMessage('El propietario debe ser un ID válido.'),

    body('estates_id')
        .notEmpty()
        .withMessage('La propiedad es obligatoria.')
        .isInt({ min: 1 })
        .withMessage('La propiedad debe ser un ID válido.'),

    body('invoice_date')
        .notEmpty()
        .withMessage('La fecha de factura es obligatoria.')
        .isISO8601()
        .withMessage('La fecha de factura debe tener formato válido (YYYY-MM-DD).')
        .custom(value => {
            const invoiceDate = new Date(value);
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            if (invoiceDate > today) {
                throw new Error('La fecha de factura no puede ser futura.');
            }
            if (invoiceDate < oneYearAgo) {
                throw new Error('La fecha de factura no puede ser anterior a un año.');
            }
            return true;
        }),

    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de vencimiento debe tener formato válido (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (value && req.body.invoice_date) {
                const dueDate = new Date(value);
                const invoiceDate = new Date(req.body.invoice_date);

                if (dueDate <= invoiceDate) {
                    throw new Error('La fecha de vencimiento debe ser posterior a la fecha de factura.');
                }
            }
            return true;
        }),

    // ==========================================
    // IMPORTES FISCALES
    // ==========================================

    body('tax_base')
        .notEmpty()
        .withMessage('La base imponible es obligatoria.')
        .isFloat({ min: 0.01, max: 999999.99 })
        .withMessage('La base imponible debe ser un número entre 0.01 y 999,999.99.')
        .custom(value => {
            const rounded = Math.round(parseFloat(value) * 100) / 100;
            if (rounded !== parseFloat(value)) {
                throw new Error('La base imponible no puede tener más de 2 decimales.');
            }
            return true;
        }),

    body('iva')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El porcentaje de IVA debe estar entre 0 y 100.')
        .custom(value => {
            if (value !== undefined) {
                const validIvaRates = [0, 4, 10, 21]; // Tipos de IVA españoles
                const rate = parseFloat(value);
                if (!validIvaRates.includes(rate)) {
                    throw new Error('El IVA debe ser uno de los tipos válidos: 0%, 4%, 10%, 21%.');
                }
            }
            return true;
        })
        .default(21),

    body('irpf')
        .optional()
        .isFloat({ min: 0, max: 47 })
        .withMessage('El porcentaje de IRPF debe estar entre 0 y 47.')
        .custom(value => {
            if (value !== undefined) {
                const rate = parseFloat(value);
                if (rate < 0 || rate > 47) {
                    throw new Error('El IRPF debe estar entre 0% y 47%.');
                }
            }
            return true;
        })
        .default(0),

    body('ownership_percent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El porcentaje de propiedad debe estar entre 0 y 100.')
        .default(100),

    // ==========================================
    // GESTIÓN DE COBROS
    // ==========================================

    body('collection_status')
        .optional()
        .isIn(['pending', 'collected', 'overdue', 'disputed'])
        .withMessage('El estado de cobro debe ser: pending, collected, overdue o disputed.')
        .default('pending'),

    body('collection_method')
        .optional()
        .isIn(['direct_debit', 'cash', 'card', 'transfer', 'check'])
        .withMessage('El método de cobro debe ser: direct_debit, cash, card, transfer o check.')
        .default('transfer'),

    body('collection_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de cobro debe tener formato válido (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (value && req.body.invoice_date) {
                const collectionDate = new Date(value);
                const invoiceDate = new Date(req.body.invoice_date);

                if (collectionDate < invoiceDate) {
                    throw new Error('La fecha de cobro no puede ser anterior a la fecha de factura.');
                }
            }
            return true;
        }),

    body('collection_reference')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('La referencia de cobro debe tener entre 3 y 100 caracteres.'),

    body('collection_notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas de cobro no pueden exceder 500 caracteres.'),

    // ==========================================
    // FACTURACIÓN PROPORCIONAL
    // ==========================================

    body('is_proportional')
        .optional()
        .isBoolean()
        .withMessage('El campo proporcional debe ser verdadero o falso.')
        .default(false),

    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe tener formato válido (YYYY-MM-DD).')
        .custom((value, { req }) => {
            // Si es proporcional, las fechas son obligatorias
            if (req.body.is_proportional && !value) {
                throw new Error('La fecha de inicio es obligatoria para facturación proporcional.');
            }
            return true;
        }),

    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe tener formato válido (YYYY-MM-DD).')
        .custom((value, { req }) => {
            // Si es proporcional, las fechas son obligatorias
            if (req.body.is_proportional && !value) {
                throw new Error('La fecha de fin es obligatoria para facturación proporcional.');
            }

            // Validar que fecha de fin sea posterior a fecha de inicio
            if (value && req.body.start_date) {
                const endDate = new Date(value);
                const startDate = new Date(req.body.start_date);

                if (endDate <= startDate) {
                    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');
                }

                // Validar que el rango no sea mayor a 31 días
                const diffTime = endDate.getTime() - startDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 31) {
                    throw new Error('El período proporcional no puede exceder 31 días.');
                }
            }
            return true;
        }),

    body('corresponding_month')
        .optional()
        .matches(/^\d{4}-\d{2}$/)
        .withMessage('El mes de correspondencia debe tener formato YYYY-MM.')
        .custom(value => {
            if (value) {
                const [year, month] = value.split('-');
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);

                if (yearNum < 2020 || yearNum > 2030) {
                    throw new Error('El año debe estar entre 2020 y 2030.');
                }
                if (monthNum < 1 || monthNum > 12) {
                    throw new Error('El mes debe estar entre 01 y 12.');
                }
            }
            return true;
        }),

    // ==========================================
    // SISTEMA DE ABONOS/REEMBOLSOS
    // ==========================================

    body('is_refund')
        .optional()
        .isBoolean()
        .withMessage('El campo de abono debe ser verdadero o falso.')
        .default(false),

    body('original_invoice_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de la factura original debe ser un número entero positivo.')
        .custom((value, { req }) => {
            // Si es un abono, debe tener factura original
            if (req.body.is_refund && !value) {
                throw new Error('Los abonos deben tener una factura original asociada.');
            }
            return true;
        }),

    // ==========================================
    // CAMPOS OPCIONALES
    // ==========================================

    body('pdf_path')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La ruta del PDF no puede exceder 500 caracteres.'),

    body('has_attachments')
        .optional()
        .isBoolean()
        .withMessage('El campo de archivos adjuntos debe ser verdadero o falso.')
        .default(false),

    body('created_by')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del usuario creador debe ser un número entero positivo.'),

    // ==========================================
    // VALIDACIONES CRUZADAS FINALES
    // ==========================================

    body()
        .custom((value, { req }) => {
            // Si el estado es 'collected', debe tener fecha de cobro
            if (req.body.collection_status === 'collected' && !req.body.collection_date) {
                throw new Error('Las facturas marcadas como cobradas deben tener fecha de cobro.');
            }

            // Si tiene fecha de cobro, el estado no puede ser 'pending'
            if (req.body.collection_date && req.body.collection_status === 'pending') {
                throw new Error('Las facturas con fecha de cobro no pueden estar pendientes.');
            }

            // Si es un abono, la base imponible debe ser negativa
            if (req.body.is_refund && req.body.tax_base > 0) {
                throw new Error('Los abonos deben tener base imponible negativa.');
            }

            // Si no es un abono, no puede tener factura original
            if (!req.body.is_refund && req.body.original_invoice_id) {
                throw new Error('Solo los abonos pueden tener factura original asociada.');
            }

            return true;
        })
];



/**
 * NOTAS DE IMPLEMENTACIÓN:
 *
 * 1. IVA español: Validamos solo los tipos oficiales (0%, 4%, 10%, 21%)
 * 2. IRPF: Rango flexible entre 0% y 47% para cubrir todos los casos
 * 3. Fechas: Validación cruzada entre fechas de factura, vencimiento y cobro
 * 4. Facturación proporcional: Validación específica de rangos de fechas
 * 5. Estados de cobro: Validación cruzada entre estado y fecha de cobro
 * 6. Sistema de abonos: Validación de facturas rectificativas con valores negativos
 * 7. Múltiples validadores: Diferentes validadores para diferentes operaciones
 *
 * USO EN ROUTES:
 * import { validateCreateInvoiceIssued } from '../validators/validatorInvoicesIssued.js';
 *
 * router.post('/invoices-issued', validateCreateInvoiceIssued, InvoicesIssuedController.createInvoice);
 */