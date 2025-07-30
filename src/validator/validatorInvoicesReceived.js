import { body } from 'express-validator';

/**
 * Validador para facturas recibidas de proveedores
 * Incluye validaciones fiscales específicas para el sistema español de IVA
 */
export const validateCreateInvoiceReceived = [
    // ==========================================
    // DATOS BÁSICOS DE LA FACTURA
    // ==========================================

    body('invoice_number')
        .trim()
        .notEmpty()
        .withMessage('El número de factura es obligatorio.')
        .isLength({ min: 1, max: 100 })
        .withMessage('El número de factura debe tener entre 1 y 100 caracteres.')
        .matches(/^[A-Z0-9\-\/\s]+$/i)
        .withMessage('El número de factura solo puede contener letras, números, guiones y barras.'),

    body('supplier_id')
        .notEmpty()
        .withMessage('El proveedor es obligatorio.')
        .isInt({ min: 1 })
        .withMessage('El proveedor debe ser un ID válido.'),

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

    body('received_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de recepción debe tener formato válido (YYYY-MM-DD).'),

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

    body('iva_percentage')
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

    body('irpf_percentage')
        .optional()
        .isFloat({ min: 0, max: 47 })
        .withMessage('El porcentaje de IRPF debe estar entre 0 y 47.')
        .custom(value => {
            if (value !== undefined) {
                const validIrpfRates = [0, 7, 15, 19, 21]; // Tipos de IRPF españoles más comunes
                const rate = parseFloat(value);
                // Permitir cualquier valor entre los rangos, no solo los exactos
                if (rate < 0 || rate > 47) {
                    throw new Error('El IRPF debe estar entre 0% y 47%.');
                }
            }
            return true;
        })
        .default(0),

    // ==========================================
    // CATEGORIZACIÓN
    // ==========================================

    body('category')
        .notEmpty()
        .withMessage('La categoría es obligatoria.')
        .isIn([
            'electricidad', 'gas', 'agua', 'comunidad', 'seguro',
            'residuos', 'mantenimiento', 'reparaciones', 'mobiliario',
            'servicios_profesionales', 'suministros', 'otros'
        ])
        .withMessage('La categoría debe ser una de las opciones válidas.'),

    body('subcategory')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La subcategoría debe tener entre 2 y 100 caracteres.'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('La descripción es obligatoria.')
        .isLength({ min: 5, max: 500 })
        .withMessage('La descripción debe tener entre 5 y 500 caracteres.'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres.'),

    // ==========================================
    // GESTIÓN DE PAGOS
    // ==========================================

    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'overdue', 'disputed'])
        .withMessage('El estado de pago debe ser: pending, paid, overdue o disputed.')
        .default('pending'),

    body('payment_method')
        .optional()
        .isIn(['transfer', 'direct_debit', 'cash', 'card', 'check'])
        .withMessage('El método de pago debe ser: transfer, direct_debit, cash, card o check.')
        .default('transfer'),

    body('payment_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de pago debe tener formato válido (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (value && req.body.invoice_date) {
                const paymentDate = new Date(value);
                const invoiceDate = new Date(req.body.invoice_date);

                if (paymentDate < invoiceDate) {
                    throw new Error('La fecha de pago no puede ser anterior a la fecha de factura.');
                }
            }
            return true;
        }),

    body('payment_reference')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('La referencia de pago debe tener entre 3 y 100 caracteres.'),

    body('payment_notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas de pago no pueden exceder 500 caracteres.'),

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
    // CAMPOS OPCIONALES
    // ==========================================

    body('property_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de la propiedad debe ser un número entero positivo.'),

    body('our_reference')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Nuestra referencia debe tener entre 3 y 100 caracteres.'),

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

    // ==========================================
    // VALIDACIONES CRUZADAS FINALES
    // ==========================================

    body()
        .custom((value, { req }) => {
            // Si el estado es 'paid', debe tener fecha de pago
            if (req.body.payment_status === 'paid' && !req.body.payment_date) {
                throw new Error('Las facturas marcadas como pagadas deben tener fecha de pago.');
            }

            // Si tiene fecha de pago, el estado no puede ser 'pending'
            if (req.body.payment_date && req.body.payment_status === 'pending') {
                throw new Error('Las facturas con fecha de pago no pueden estar pendientes.');
            }

            return true;
        })
];

/**
 * NOTAS DE IMPLEMENTACIÓN:
 *
 * 1. IVA español: Validamos solo los tipos oficiales (0%, 4%, 10%, 21%)
 * 2. IRPF: Rango flexible entre 0% y 47% para cubrir todos los casos
 * 3. Fechas: Validación cruzada entre fechas de factura, vencimiento y pago
 * 4. Facturación proporcional: Validación específica de rangos de fechas
 * 5. Estados de pago: Validación cruzada entre estado y fecha de pago
 * 6. Categorías: Lista cerrada de categorías válidas para gastos
 *
 * USO EN ROUTES:
 * import { validateCreateInvoiceReceived } from '../validators/validatorInvoicesReceived.js';
 *
 * router.post('/invoices-received', validateCreateInvoiceReceived, InvoicesReceivedController.createInvoiceReceived);
 */