import InvoicesIssuedService from "../../services/invoicesIssuedServices.js";

/**
 * HELPER PARA CÁLCULOS DE FACTURAS Y VALIDACIONES
 *
 * ¿Qué hace este archivo?
 * - Calcula totales de facturas aplicando impuestos españoles (IVA e IRPF)
 * - Maneja cálculos proporcionales por días (para facturas parciales)
 * - Valida fechas y rangos de tiempo
 * - Genera descripciones legibles de períodos
 * - CENTRALIZA validaciones para evitar duplicación de código
 */
export default class CalculateHelper {

    // ===========================================
    // 1. CONSTANTES Y DATOS ESTÁTICOS
    // Comentario: Métodos que devuelven listas de valores fijos (categorías, estados, etc.).
    // Agruparlos al principio facilita su consulta y modificación.
    // ===========================================

    static getValidInvoicesIssuedStatuses() {
        return ['pending', 'paid', 'overdue', 'disputed'];
    }

    static getValidInvoicesReceivedStatuses() {
        return ['pending', 'collected', 'overdue', 'disputed'];
    }

    static getValidPaymentMethods() {
        return ['transfer', 'direct_debit', 'cash', 'card', 'check'];
    }

    static getValidPaymentMethodExpenses() {
        return ['cash', 'card', 'transfer', 'direct_debit', 'check', 'company_card', 'petty_cash'];
    }

    static getValidInvoiceExpenseCategory() {
        return [
            'office_supplies', 'equipment_furniture', 'travel_transport', 'marketing_advertising',
            'professional_services', 'maintenance_repairs', 'training_education', 'communications',
            'representation', 'taxes_fees', 'financial_costs', 'utilities', 'software_licenses',
            'insurance', 'legal_administrative', 'cleaning_security', 'other'
        ];
    }

    // Obtiene gastos por proveedor
    static getExpensesStatus() {
        return ['pending', 'approved', 'rejected', 'paid'];
    }

    //Búsqueda avanzada con múltiples filtros
    static getValidExpensesCategoryAdvanced() {
        return [
            'office_supplies', 'equipment_furniture', 'travel_transport', 'marketing_advertising',
            'professional_services', 'maintenance_repairs', 'training_education', 'communications',
            'representation', 'taxes_fees', 'financial_costs', 'utilities', 'software_licenses',
            'insurance', 'legal_administrative', 'cleaning_security', 'other'
        ];
    }

    //Categorías válidas para facturas recibidas
    static getValidInvoiceReceivedCategories() {
        return [
            'electricidad', 'gas', 'agua', 'comunidad', 'seguro',
            'residuos', 'mantenimiento', 'reparaciones', 'mobiliario',
            'servicios_profesionales', 'suministros', 'otros'
        ];
    }

    static getAvailableCategories() {
        return [
            {value: 'electricidad', label: 'Electricidad'},
            {value: 'gas', label: 'Gas'},
            {value: 'agua', label: 'Agua'},
            {value: 'comunidad', label: 'Comunidad'},
            {value: 'seguro', label: 'Seguro'},
            {value: 'residuos', label: 'Residuos'},
            {value: 'mantenimiento', label: 'Mantenimiento'},
            {value: 'reparaciones', label: 'Reparaciones'},
            {value: 'mobiliario', label: 'Mobiliario'},
            {value: 'servicios_profesionales', label: 'Servicios Profesionales'},
            {value: 'suministros', label: 'Suministros'},
            {value: 'otros', label: 'Otros'}
        ];
    }

    //Obtiene categorías disponibles expenses
    static getAvailableExpensesCategories() {
        return [
            {value: 'office_supplies', label: 'Material de oficina'},
            {value: 'equipment_furniture', label: 'Equipos y mobiliario'},
            {value: 'travel_transport', label: 'Viajes y transporte'},
            {value: 'marketing_advertising', label: 'Marketing y publicidad'},
            {value: 'professional_services', label: 'Servicios profesionales'},
            {value: 'maintenance_repairs', label: 'Mantenimiento y reparaciones'},
            {value: 'training_education', label: 'Formación y educación'},
            {value: 'communications', label: 'Comunicaciones'},
            {value: 'representation', label: 'Gastos de representación'},
            {value: 'taxes_fees', label: 'Impuestos y tasas'},
            {value: 'financial_costs', label: 'Costes financieros'},
            {value: 'utilities', label: 'Suministros básicos'},
            {value: 'software_licenses', label: 'Licencias de software'},
            {value: 'insurance', label: 'Seguros'},
            {value: 'legal_administrative', label: 'Gastos legales y administrativos'},
            {value: 'cleaning_security', label: 'Limpieza y seguridad'},
            {value: 'other', label: 'Otros gastos'}
        ];
    }

    //Obtiene métodos de pago disponibles
    static getAvailablePaymentMethods() {
        return [
            {value: 'cash', label: 'Efectivo'},
            {value: 'card', label: 'Tarjeta de crédito/débito'},
            {value: 'transfer', label: 'Transferencia bancaria'},
            {value: 'direct_debit', label: 'Domiciliación'},
            {value: 'check', label: 'Cheque'},
            {value: 'company_card', label: 'Tarjeta de empresa'},
            {value: 'petty_cash', label: 'Caja chica'}
        ];
    }

    //Obtiene estados disponibles
    static getAvailableStatuses() {
        return [
            {value: 'pending', label: 'Pendiente', color: 'warning'},
            {value: 'approved', label: 'Aprobado', color: 'success'},
            {value: 'rejected', label: 'Rechazado', color: 'danger'},
            {value: 'paid', label: 'Pagado', color: 'info'}
        ];
    }

    //Obtiene períodos de recurrencia disponibles
    static getAvailableRecurrencePeriods() {
        return [
            {value: 'monthly', label: 'Mensual'},
            {value: 'quarterly', label: 'Trimestral'},
            {value: 'yearly', label: 'Anual'}
        ];
    }


    // ===========================================
    // 2. CÁLCULOS FISCALES Y DE TOTALES
    // Comentario: Funciones principales para calcular importes de facturas y gastos,
    // incluyendo impuestos y lógica proporcional.
    // ===========================================

    static calculateTotal(tax_base, iva, irpf) {
        const base = parseFloat(tax_base) || 0;
        const ivaPercent = parseFloat(iva) || 0;
        const irpfPercent = parseFloat(irpf) || 0;
        const total = base + (base * ivaPercent / 100) - (base * irpfPercent / 100);
        return parseFloat(total.toFixed(2));
    }

    static calculateProportionalTotal(tax_base, iva, irpf, start_date, end_date) {
        // VALIDAR DATOS DE ENTRADA
        const base = parseFloat(tax_base) || 0;
        const ivaPercent = parseFloat(iva) || 0;
        const irpfPercent = parseFloat(irpf) || 0;

        if (!start_date || !end_date) {
            // Si no hay fechas, usar cálculo normal
            return {
                original_base: base,
                proportional_base: base,
                days_billed: 0,
                days_in_month: 0,
                proportion_percentage: 100,
                iva_amount: (base * ivaPercent / 100),
                irpf_amount: (base * irpfPercent / 100),
                total: this.calculateTotal(base, ivaPercent, irpfPercent)
            };
        }
        // CONVERTIR FECHAS
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        // CALCULAR DÍAS FACTURADOS (inclusivo)
        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysBilled = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // +1 para incluir ambos días

        //  CALCULAR DÍAS DEL MES (del mes donde está la fecha de inicio)
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Último día del mes

        // CALCULAR PROPORCIÓN
        const proportion = daysBilled / daysInMonth;
        const proportionPercentage = Math.round(proportion * 100 * 100) / 100; // Redondear a 2 decimales

        // APLICAR PROPORCIÓN A LA BASE IMPONIBLE
        const proportionalBase = base * proportion;

        //  CALCULAR IVA E IRPF SOBRE LA BASE PROPORCIONAL
        const ivaAmount = proportionalBase * ivaPercent / 100;
        const irpfAmount = proportionalBase * irpfPercent / 100;

        //  CALCULAR TOTAL FINAL
        const total = proportionalBase + ivaAmount - irpfAmount;

        // RETORNAR OBJETO COMPLETO CON TODOS LOS DETALLES
        return {
            original_base: parseFloat(base.toFixed(2)),
            proportional_base: parseFloat(proportionalBase.toFixed(2)),
            days_billed: daysBilled,
            days_in_month: daysInMonth,
            proportion_percentage: proportionPercentage,
            iva_amount: parseFloat(ivaAmount.toFixed(2)),
            irpf_amount: parseFloat(irpfAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }

    static calculateBillTotal(billData) {
        const {
            tax_base,
            iva,
            irpf,
            is_proportional,
            start_date,
            end_date
        } = billData;

        // Si NO es proporcional o no tiene fechas, usar cálculo normal
        if (!is_proportional || !start_date || !end_date) {
            return {
                total: this.calculateTotal(tax_base, iva, irpf),
                calculation_type: 'normal',
                details: {
                    original_base: parseFloat(tax_base) || 0,
                    final_base: parseFloat(tax_base) || 0,
                    iva_amount: (parseFloat(tax_base) || 0) * (parseFloat(iva) || 0) / 100,
                    irpf_amount: (parseFloat(tax_base) || 0) * (parseFloat(irpf) || 0) / 100
                }
            };
        }

        // Si ES proporcional, usar cálculo proporcional
        const proportionalResult = this.calculateProportionalTotal(tax_base, iva, irpf, start_date, end_date);

        return {
            total: proportionalResult.total,
            calculation_type: 'proportional',
            details: proportionalResult
        };
    }

    static calculateExpenseTotal(expenseData) {
        // 1️⃣ CALCULAR BASE TOTAL (suma de todos los gastos)
        const baseTotal = (
            (parseFloat(expenseData.monthly_rent) || 0) +
            (parseFloat(expenseData.electricity) || 0) +
            (parseFloat(expenseData.gas) || 0) +
            (parseFloat(expenseData.water) || 0) +
            (parseFloat(expenseData.community_fees) || 0) +
            (parseFloat(expenseData.insurance) || 0) +
            (parseFloat(expenseData.waste_tax) || 0) +
            (parseFloat(expenseData.others) || 0)
        );

        const {
            is_proportional,
            start_date,
            end_date
        } = expenseData;

        // 2️⃣ Si NO es proporcional o no tiene fechas, usar cálculo normal
        if (!is_proportional || !start_date || !end_date) {
            return {
                total: parseFloat(baseTotal.toFixed(2)),
                calculation_type: 'normal',
                details: {
                    original_base: baseTotal,
                    final_base: baseTotal,
                    total_expenses: baseTotal
                }
            };
        }

        // 3️⃣ Si ES proporcional, usar cálculo proporcional
        const proportionalResult = this.calculateProportionalTotal(
            baseTotal,
            0, // Los gastos no tienen IVA
            0, // Los gastos no tienen IRPF
            start_date,
            end_date
        );

        return {
            total: proportionalResult.total,
            calculation_type: 'proportional',
            details: proportionalResult
        };
    }

    static calculateExpenseSimpleTotal(expenseData) {
        // Si ya tiene total_expenses calculado, usarlo
        if (expenseData.total_expenses && expenseData.total_expenses !== 0) {
            return parseFloat(expenseData.total_expenses);
        }

        // Si no, calcularlo sumando todos los campos
        return (
            (parseFloat(expenseData.monthly_rent) || 0) +
            (parseFloat(expenseData.electricity) || 0) +
            (parseFloat(expenseData.gas) || 0) +
            (parseFloat(expenseData.water) || 0) +
            (parseFloat(expenseData.community_fees) || 0) +
            (parseFloat(expenseData.insurance) || 0) +
            (parseFloat(expenseData.waste_tax) || 0) +
            (parseFloat(expenseData.others) || 0)
        );
    }

    static calculateFiscalAmounts(data) {
        const {tax_base, iva_percentage, irpf_percentage, is_proportional, start_date, end_date} = data;

        let effectiveTaxBase = tax_base;

        // Si es proporcional, calcular base imponible proporcional
        if (is_proportional && start_date && end_date) {
            const proportionalData = {
                tax_base,
                iva: iva_percentage,
                irpf: irpf_percentage,
                is_proportional: true,
                start_date,
                end_date
            };
            const calculation = this.calculateBillTotal(proportionalData);
            effectiveTaxBase = calculation.details.proportional_base || tax_base;
        }

        const iva_amount = Math.round((effectiveTaxBase * (iva_percentage / 100)) * 100) / 100;
        const irpf_amount = Math.round((effectiveTaxBase * (irpf_percentage / 100)) * 100) / 100;
        const total_amount = Math.round((effectiveTaxBase + iva_amount - irpf_amount) * 100) / 100;

        return {
            tax_base: effectiveTaxBase,
            iva_percentage,
            iva_amount,
            irpf_percentage,
            irpf_amount,
            total_amount
        };
    }

    static calculateIVA(amount, ivaPercentage) {
        const validIvaRates = [0, 4, 10, 21];
        const ivaRate = Number(ivaPercentage);

        if (!validIvaRates.includes(ivaRate)) {
            throw new Error('Porcentaje de IVA no válido. Debe ser 0%, 4%, 10% o 21%.');
        }

        const baseAmount = Number(amount);
        if (isNaN(baseAmount) || baseAmount < 0) {
            throw new Error('El importe debe ser un número positivo.');
        }

        return Math.round((baseAmount * ivaRate / 100) * 100) / 100;
    }

    // ===========================================
    // 3. LÓGICA DE FECHAS, PERÍODOS Y RECURRENCIA
    // Comentario: Métodos dedicados a la manipulación y cálculo de fechas.
    // Se ha eliminado la función `generatePeriodDescription` duplicada.
    // ===========================================

    static getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    static calculateDaysBetween(start_date, end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const timeDifference = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
    }

    static generateCorrespondingMonth(date, corresponding_month = null) {
        // Si se especifica manualmente, usarlo
        if (corresponding_month) {
            return corresponding_month;
        }

        // Si no, extraer del fecha de la factura
        if (date) {
            const billDate = new Date(date);
            const year = billDate.getFullYear();
            const month = (billDate.getMonth() + 1).toString().padStart(2, '0');
            return `${year}-${month}`;
        }

        return null;
    }

    static generatePeriodDescription(start_date, end_date) {
        if (!start_date || !end_date) return 'Mes completo';
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const monthName = monthNames[startDate.getMonth()];
        const year = startDate.getFullYear();
        return `Del ${startDay} al ${endDay} de ${monthName} de ${year}`;
    }

    static extractYearMonth(date) {
        if (!date) return {year: null, month: null};
        const dateObj = new Date(date);
        return {year: dateObj.getFullYear(), month: dateObj.getMonth() + 1};
    }

    static calculateNextOccurrence(currentDate, period) {
        const date = new Date(currentDate);

        switch (period) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                throw new Error('Período de recurrencia no válido. Debe ser: monthly, quarterly o yearly.');
        }

        return date.toISOString().split('T')[0];
    }

    // ===========================================
    // 4. VALIDACIONES CENTRALIZADAS
    // Comentario: Métodos que validan datos de entrada para garantizar la integridad
    // antes de realizar cálculos.
    // ===========================================

    static validateProportionalFields(billData) {
        const {is_proportional, start_date, end_date} = billData;

        // Si NO es proporcional, no validar fechas
        if (!is_proportional) {
            return {isValid: true, message: ''};
        }

        // Si ES proporcional, validar fechas
        if (!start_date || !end_date) {
            return {
                isValid: false,
                message: 'Las facturas proporcionales requieren fecha de inicio y fin'
            };
        }

        // Validar que fecha de inicio sea menor que fecha de fin
        if (new Date(start_date) >= new Date(end_date)) {
            return {
                isValid: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            };
        }

        return {isValid: true, message: ''};
    }

    static validateDateRange(startDate, endDate, options = {}) {
        const {
            maxRangeYears = 2,
            allowFutureDates = false,
            returnDaysCount = false
        } = options;

        // Validar que existan las fechas
        if (!startDate || !endDate) {
            return {
                isValid: false,
                message: 'Fechas de inicio y fin son requeridas.'
            };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validar formato de fecha
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return {
                isValid: false,
                message: 'Formato de fecha inválido.'
            };
        }

        // Validar orden de fechas
        if (end <= start) {
            return {
                isValid: false,
                message: 'La fecha de fin debe ser posterior a la fecha de inicio.'
            };
        }

        // Validar fechas futuras (opcional)
        if (!allowFutureDates && start > new Date()) {
            return {
                isValid: false,
                message: 'La fecha de inicio no puede ser futura.'
            };
        }

        // Validar rango máximo (opcional)
        if (maxRangeYears > 0) {
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const maxDays = maxRangeYears * 365;

            if (diffDays > maxDays) {
                return {
                    isValid: false,
                    message: `El rango de fechas no puede exceder ${maxRangeYears} años.`
                };
            }
        }

        const result = {
            isValid: true,
            message: 'Rango de fechas válido.'
        };

        // Incluir conteo de días si se solicita
        if (returnDaysCount) {
            result.daysBilled = this.calculateDaysBetween(startDate, endDate);
        }

        return result;
    }

    static validateRecurringFields(data) {
        if (data.is_recurring) {
            if (!data.recurrence_period) {
                return {
                    isValid: false,
                    message: 'Los gastos recurrentes deben tener un período de recurrencia.'
                };
            }

            const validPeriods = ['monthly', 'quarterly', 'yearly'];
            if (!validPeriods.includes(data.recurrence_period)) {
                return {
                    isValid: false,
                    message: 'Período de recurrencia no válido. Debe ser: monthly, quarterly o yearly.'
                };
            }
        } else {
            // Si no es recurrente, no debe tener datos de recurrencia
            if (data.recurrence_period || data.next_occurrence_date) {
                return {
                    isValid: false,
                    message: 'Los gastos no recurrentes no pueden tener período de recurrencia.'
                };
            }
        }

        return {isValid: true, message: 'Campos de recurrencia válidos.'};
    }

    static validateDateParams(year, quarter, month) {
        if (!year || year < 2020 || year > 2030) {
            return {isValid: false, message: 'Año debe estar entre 2020 y 2030'};
        }

        if (quarter && (quarter < 1 || quarter > 4)) {
            return {isValid: false, message: 'Trimestre debe estar entre 1 y 4'};
        }

        if (month && (month < 1 || month > 12)) {
            return {isValid: false, message: 'Mes debe estar entre 1 y 12'};
        }

        return {isValid: true, message: 'Parámetros válidos'};
    }

    // ===========================================
    // 5. LIBROS DE IVA (SOPORTADO Y REPERCUTIDO)
    // Comentario: Lógica específica para formatear y calcular los libros de IVA
    // según los requerimientos de la AEAT. Se ha eliminado `determineOperationKey` duplicada.
    // ===========================================

    static formatVATSupportedEntries(invoicesReceived, internalExpenses) {
        const entries = [];
        let index = 0;

        // Mapear facturas recibidas
        invoicesReceived.forEach(invoice => {
            entries.push(this.mapInvoiceReceivedToVATEntry(invoice, index));
            index++;
        });

        // Mapear gastos internos
        internalExpenses.forEach(expense => {
            entries.push(this.mapInternalExpenseToVATEntry(expense, index));
            index++;
        });

        // Ordenar por fecha
        return entries.sort((a, b) => new Date(a.fechaFactura) - new Date(b.fechaFactura));
    }

    static calculateVATSupportedTotals(entries) {
        const deductibleEntries = entries.filter(e => e.deducible);

        return {
            totalEntradas: entries.length,
            entradasDeducibles: deductibleEntries.length,
            entradasNoDeducibles: entries.length - deductibleEntries.length,

            // Totales generales
            totalBaseImponible: this.roundCurrency(entries.reduce((sum, e) => sum + e.baseImponible, 0)),
            totalCuotaIVA: this.roundCurrency(entries.reduce((sum, e) => sum + e.cuotaIVA, 0)),
            totalCuotaIRPF: this.roundCurrency(entries.reduce((sum, e) => sum + e.cuotaIRPF, 0)),
            totalImporte: this.roundCurrency(entries.reduce((sum, e) => sum + e.importeTotal, 0)),

            // Totales deducibles (importante para liquidación)
            baseImponibleDeducible: this.roundCurrency(deductibleEntries.reduce((sum, e) => sum + e.baseImponible, 0)),
            cuotaIVADeducible: this.roundCurrency(deductibleEntries.reduce((sum, e) => sum + e.cuotaIVA, 0)),

            // Desglose por tipos de IVA
            desgloseIVA: this.calculateVATBreakdown(entries)
        };
    }

    static formatVATChargedEntries(invoicesIssued) {
        return invoicesIssued.map((invoice, index) =>
            this.mapInvoiceIssuedToVATEntry(invoice, index)
        ).sort((a, b) => new Date(a.fechaFactura) - new Date(b.fechaFactura));
    }

    static calculateVATChargedTotals(entries) {
        return {
            totalEntradas: entries.length,

            // Totales de facturación
            totalBaseImponible: this.roundCurrency(entries.reduce((sum, e) => sum + e.baseImponible, 0)),
            totalCuotaIVA: this.roundCurrency(entries.reduce((sum, e) => sum + e.cuotaIVA, 0)),
            totalCuotaIRPF: this.roundCurrency(entries.reduce((sum, e) => sum + e.cuotaIRPF, 0)),
            totalImporte: this.roundCurrency(entries.reduce((sum, e) => sum + e.importeTotal, 0)),

            // Estados de cobro
            facturasCobradas: entries.filter(e => e.estadoCobro === 'collected').length,
            facturasPendientes: entries.filter(e => e.estadoCobro === 'pending').length,
            facturasVencidas: entries.filter(e => e.estadoCobro === 'overdue').length,

            // Desglose por tipos de IVA
            desgloseIVA: this.calculateVATBreakdown(entries),

            // Facturación proporcional
            facturasProporcionaales: entries.filter(e => e.esProporcional).length
        };
    }

    static mapInvoiceIssuedToVATEntry(invoice, index) {
        return {
            // Campos obligatorios según AEAT
            numeroRegistro: index + 1,
            fechaFactura: invoice.invoice_date,
            numeroFactura: invoice.invoice_number,
            nombreCliente: invoice.client_name || 'Cliente',
            nifCliente: invoice.client_nif || '',

            // Importes fiscales
            baseImponible: parseFloat(invoice.tax_base || 0),
            tipoIVA: parseFloat(invoice.iva || 0),
            cuotaIVA: parseFloat((invoice.tax_base * invoice.iva / 100) || 0),
            tipoIRPF: parseFloat(invoice.irpf || 0),
            cuotaIRPF: parseFloat((invoice.tax_base * invoice.irpf / 100) || 0),
            importeTotal: parseFloat(invoice.total || 0),

            // Información adicional
            concepto: 'Servicios profesionales',
            tipoFactura: this.determineInvoiceType(invoice),
            fechaVencimiento: invoice.due_date,
            estadoCobro: invoice.collection_status || 'pending',

            // Clasificación fiscal
            claveOperacion: this.determineOperationKey(invoice),
            reglaInversion: false,

            // Facturación proporcional
            esProporcional: Boolean(invoice.is_proportional),
            fechaInicio: invoice.start_date,
            fechaFin: invoice.end_date,

            // Metadatos
            origen: 'FACTURA_EMITIDA',
            registroId: invoice.id
        };
    }

    static mapInvoiceReceivedToVATEntry(invoice, index) {
        return {
            // Campos obligatorios según AEAT
            numeroRegistro: index + 1,
            fechaFactura: invoice.invoice_date,
            numeroFactura: invoice.invoice_number || 'N/A',
            nombreProveedor: invoice.supplier_name || invoice.supplier_company || 'Proveedor',
            nifProveedor: invoice.supplier_tax_id || '',

            // Importes fiscales
            baseImponible: parseFloat(invoice.tax_base || 0),
            tipoIVA: parseFloat(invoice.iva_percentage || 0),
            cuotaIVA: parseFloat(invoice.iva_amount || 0),
            tipoIRPF: parseFloat(invoice.irpf_percentage || 0),
            cuotaIRPF: parseFloat(invoice.irpf_amount || 0),
            importeTotal: parseFloat(invoice.total_amount || 0),

            // Información adicional
            concepto: invoice.description || invoice.category || '',
            deducible: true,
            fechaRecepcion: invoice.received_date || invoice.invoice_date,
            estadoPago: invoice.payment_status || 'pending',

            // Clasificación fiscal
            claveOperacion: this.determineOperationKey(invoice),
            reglaInversion: false,

            // Metadatos
            origen: 'FACTURA_RECIBIDA',
            registroId: invoice.id
        };
    }

    static mapInternalExpenseToVATEntry(expense, index) {
        return {
            // Campos obligatorios según AEAT
            numeroRegistro: index + 1,
            fechaFactura: expense.expense_date,
            numeroFactura: expense.receipt_number || `INT-${expense.id}`,
            nombreProveedor: expense.supplier_name || 'Proveedor interno',
            nifProveedor: expense.supplier_nif || '',

            // Importes fiscales
            baseImponible: parseFloat(expense.amount || 0),
            tipoIVA: parseFloat(expense.iva_percentage || 0),
            cuotaIVA: parseFloat(expense.iva_amount || 0),
            tipoIRPF: 0,
            cuotaIRPF: 0,
            importeTotal: parseFloat(expense.total_amount || 0),

            // Información adicional
            concepto: expense.description || expense.category || '',
            deducible: Boolean(expense.is_deductible),
            fechaRecepcion: expense.expense_date,
            estadoPago: expense.status || 'pending',

            // Clasificación fiscal
            claveOperacion: this.determineOperationKey(expense),
            reglaInversion: false,

            // Metadatos
            origen: 'GASTO_INTERNO',
            registroId: expense.id
        };
    }

    static determineOperationKey(entry) {
        if (entry.is_refund) return '02'; // Abono
        if ((entry.iva_percentage === 0 && entry.iva_percentage !== undefined) || (entry.iva === 0 && entry.iva !== undefined)) return '03'; // Exento
        return '01'; // Operación general
    }

    static determineInvoiceType(entry) {
        const total = entry.total || entry.total_amount;
        if (entry.is_refund) return 'F4'; // Factura rectificativa
        if (total < 400) return 'F2'; // Factura simplificada
        return 'F1'; // Factura completa
    }

    static generateVATChargedSummary(entries) {
        return {
            totalClientes: new Set(entries.map(e => e.nifCliente)).size,
            facturasPorEstado: this.groupByField(entries, 'estadoCobro'),
            facturasPorTipoIVA: this.groupByField(entries, 'tipoIVA'),
            importePromedio: this.roundCurrency(
                entries.reduce((sum, e) => sum + e.importeTotal, 0) / entries.length
            )
        };
    }

    static generateVATSupportedSummary(entries) {
        return {
            totalProveedores: new Set(entries.map(e => e.nifProveedor)).size,
            facturasPorEstado: this.groupByField(entries, 'estadoPago'),
            facturasPorTipoIVA: this.groupByField(entries, 'tipoIVA'),
            importePromedio: this.roundCurrency(
                entries.reduce((sum, e) => sum + e.importeTotal, 0) / entries.length
            )
        };
    }

    // ===========================================
    // 6. LIQUIDACIÓN DE IVA Y CONSOLIDACIÓN
    // Comentario: Funciones de alto nivel que combinan datos de diferentes fuentes
    // para generar informes complejos, como la liquidación trimestral o por propietario.
    // ===========================================

    static calculateVATLiquidation(supportedBook, chargedBook) {
        const ivaRepercutido = chargedBook.totals.totalCuotaIVA;
        const ivaSoportado = supportedBook.totals.cuotaIVADeducible;
        const diferenciaIVA = ivaRepercutido - ivaSoportado;

        return {
            // IVA Repercutido (a ingresar)
            ivaRepercutido: this.roundCurrency(ivaRepercutido),

            // IVA Soportado (deducible)
            ivaSoportado: this.roundCurrency(ivaSoportado),

            // Diferencia (resultado de la liquidación)
            diferenciaIVA: this.roundCurrency(diferenciaIVA),

            // Resultado
            resultadoLiquidacion: diferenciaIVA > 0 ? 'A_INGRESAR' : 'A_DEVOLVER',
            importeResultado: Math.abs(this.roundCurrency(diferenciaIVA)),

            // Retenciones IRPF
            totalRetenciones: this.roundCurrency(
                chargedBook.totals.totalCuotaIRPF + supportedBook.totals.totalCuotaIRPF
            ),

            // Bases imponibles
            baseImponibleTotal: this.roundCurrency(
                chargedBook.totals.totalBaseImponible + supportedBook.totals.totalBaseImponible
            ),

            // Desglose por tipos de IVA
            desgloseGeneral: this.combineVATBreakdowns(
                supportedBook.totals.desgloseIVA,
                chargedBook.totals.desgloseIVA
            )
        };
    }

    static calculateVATBookByOwner(invoicesIssued, invoicesReceived, internalExpenses, allOwners, year, quarter = null, month = null) {
        const ownerSummary = {};
        const ownerIds = allOwners.map(o => o.id); // IDs de los propietarios para reparto general
        const ownerMap = new Map(allOwners.map(owner => [owner.id, owner.name]));

        // Función auxiliar para inicializar el resumen de un propietario
        const initializeOwnerSummary = (ownerId) => {
            if (!ownerSummary[ownerId]) {
                ownerSummary[ownerId] = {
                    owner_id: ownerId,
                    owner_name: ownerMap.get(ownerId) || `Propietario ${ownerId}`,
                    issued: {base: 0, iva: 0, irpf: 0, total: 0, count: 0},
                    received: {base: 0, iva: 0, irpf: 0, total: 0, count: 0},
                    internal_expenses: {base: 0, iva: 0, total: 0, count: 0}
                };
            }
        };

        // Filtrar los datos por el período especificado
        let filteredIssued = this.filterRecordsByDate(invoicesIssued, year, quarter, month, 'invoice_date');
        let filteredReceived = this.filterRecordsByDate(invoicesReceived, year, quarter, month, 'invoice_date');
        let filteredExpenses = this.filterRecordsByDate(internalExpenses, year, quarter, month, 'expense_date');

        // Procesar Facturas Emitidas
        for (const invoice of filteredIssued) {
            const ownerId = invoice.owners_id;
            const ownershipPercent = invoice.ownership_percent || 0;

            // Se espera que las facturas emitidas siempre tengan un owner_id y ownership_percent válido
            if (ownerId && ownershipPercent > 0) {
                initializeOwnerSummary(ownerId);
                const share = ownershipPercent / 100;

                ownerSummary[ownerId].issued.base += invoice.tax_base * share;
                ownerSummary[ownerId].issued.iva += (invoice.tax_base * invoice.iva / 100) * share;
                ownerSummary[ownerId].issued.irpf += (invoice.tax_base * invoice.irpf / 100) * share;
                ownerSummary[ownerId].issued.total += invoice.total * share;
                ownerSummary[ownerId].issued.count += 1;
            }
        }

        // Procesar Facturas Recibidas y Gastos Internos
        // Estos pueden estar asociados a una propiedad con reparto o ser gastos generales de la "empresa"
        const processSharedItems = (items, type) => {
            for (const item of items) {
                if (item.owners_id && item.ownership_percent > 0) {
                    // Caso: asociado a una propiedad con propietarios y porcentajes específicos
                    initializeOwnerSummary(item.owners_id);
                    const share = item.ownership_percent / 100;
                    ownerSummary[item.owners_id][type].base += (item.tax_base !== undefined ? item.tax_base : item.amount) * share;
                    ownerSummary[item.owners_id][type].iva += (item.iva_amount !== undefined ? item.iva_amount : (item.amount * item.iva_percentage / 100)) * share;
                    ownerSummary[item.owners_id][type].irpf += (item.irpf_amount !== undefined ? item.irpf_amount : 0) * share; // Gastos internos no tienen irpf
                    ownerSummary[item.owners_id][type].total += item.total_amount * share;
                    ownerSummary[item.owners_id][type].count += 1;
                } else if (!item.property_id) {
                    // Caso: Gasto/Factura no asociado a ninguna propiedad, se asume general de la empresa
                    // y se reparte equitativamente entre los 3 propietarios.
                    // Esto aplica la lógica de "el 100% se dividen entre los tres".
                    const totalAmount = item.total_amount;
                    const ivaAmount = item.iva_amount || 0;
                    const taxBase = item.tax_base || item.amount;
                    const irpfAmount = item.irpf_amount || 0;

                    const shares = [0.3333, 0.3333, 0.3334]; // Reparto 100% entre 3, ajustando para sumar 100%
                    ownerIds.forEach((ownerId, index) => {
                        initializeOwnerSummary(ownerId);
                        const share = shares[index];
                        ownerSummary[ownerId][type].base += taxBase * share;
                        ownerSummary[ownerId][type].iva += ivaAmount * share;
                        ownerSummary[ownerId][type].irpf += irpfAmount * share;
                        ownerSummary[ownerId][type].total += totalAmount * share;
                        ownerSummary[ownerId][type].count += 1;
                    });
                }
                // Si tiene property_id pero owners_id/ownership_percent son null/0, significa que la propiedad
                // no tiene propietarios en estates_owners para ese ID de propiedad, o no se ha configurado el reparto.
                // En este caso, no se imputa a ningún propietario, lo que es correcto si esos datos no son para los propietarios.
            }
        };

        processSharedItems(filteredReceived, 'received');
        processSharedItems(filteredExpenses, 'internal_expenses');

        // Preparar el resultado final
        const summaryByOwner = Object.values(ownerSummary).map(owner => ({
            owner_id: owner.owner_id,
            owner_name: owner.owner_name,
            issued: {...owner.issued, iva_amount: owner.issued.iva},
            received: {...owner.received, iva_amount: owner.received.iva},
            internal_expenses: {...owner.internal_expenses, iva_amount: owner.internal_expenses.iva},
            total_income: owner.issued.total,
            total_expenses: owner.received.total + owner.internal_expenses.total,
            net_balance: owner.issued.total - (owner.received.total + owner.internal_expenses.total),
            total_vat_charged: owner.issued.iva,
            total_vat_supported: owner.received.iva + owner.internal_expenses.iva,
            net_vat_position: owner.issued.iva - (owner.received.iva + owner.internal_expenses.iva)
        }));

        // Calcular totales generales
        const overallTotal = {
            total_income: 0,
            total_expenses: 0,
            net_balance: 0,
            total_vat_charged: 0,
            total_vat_supported: 0,
            net_vat_position: 0,
            total_irpf_retained: 0,
            total_irpf_received: 0
        };

        for (const owner of summaryByOwner) {
            overallTotal.total_income += owner.total_income;
            overallTotal.total_expenses += owner.total_expenses;
            overallTotal.total_vat_charged += owner.total_vat_charged;
            overallTotal.total_vat_supported += owner.total_vat_supported;
            overallTotal.total_irpf_retained += owner.issued.irpf;
            overallTotal.total_irpf_received += owner.received.irpf;
        }
        overallTotal.net_balance = overallTotal.total_income - overallTotal.total_expenses;
        overallTotal.net_vat_position = overallTotal.total_vat_charged - overallTotal.total_vat_supported;

        // Redondear todos los valores numéricos a 2 decimales
        this.roundObjectValues(overallTotal);
        summaryByOwner.forEach(owner => {
            this.roundObjectValues(owner.issued);
            this.roundObjectValues(owner.received);
            this.roundObjectValues(owner.internal_expenses);
            this.roundObjectValues(owner); // Para los net_balance, etc.
        });

        return {
            summary_by_owner: summaryByOwner,
            overall_total: overallTotal
        };
    }

    // ===========================================
    // 7. HELPERS Y UTILIDADES GENÉRICAS
    // Comentario: Funciones auxiliares reutilizables para tareas comunes como
    // formateo, redondeo o filtrado de datos.
    // ===========================================

    static getCalculationDetails(billData) {
        if (!billData.is_proportional) {
            return {
                type: 'normal',
                message: 'Esta factura usa cálculo normal (mes completo)'
            };
        }

        const calculation = this.calculateBillTotal(billData);
        return {
            type: 'proportional',
            ...calculation.details
        };
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    }

    static filterByQuarter(entries, quarter) {
        const quarterMonths = {
            1: [1, 2, 3],
            2: [4, 5, 6],
            3: [7, 8, 9],
            4: [10, 11, 12]
        };

        const months = quarterMonths[quarter];

        return entries.filter(entry => {
            const month = new Date(entry.fechaFactura).getMonth() + 1;
            return months.includes(month);
        });
    }

    static roundCurrency(amount) {
        return Math.round((amount || 0) * 100) / 100;
    }

    static calculateVATBreakdown(entries) {
        const breakdown = {};

        entries.forEach(entry => {
            const rate = entry.tipoIVA;
            if (!breakdown[rate]) {
                breakdown[rate] = {
                    tipoIVA: rate,
                    baseImponible: 0,
                    cuotaIVA: 0,
                    numeroFacturas: 0
                };
            }

            breakdown[rate].baseImponible += entry.baseImponible;
            breakdown[rate].cuotaIVA += entry.cuotaIVA;
            breakdown[rate].numeroFacturas += 1;
        });

        // Redondear y ordenar
        return Object.values(breakdown)
            .map(item => ({
                ...item,
                baseImponible: this.roundCurrency(item.baseImponible),
                cuotaIVA: this.roundCurrency(item.cuotaIVA)
            }))
            .sort((a, b) => b.tipoIVA - a.tipoIVA);
    }

    static groupByField(entries, field) {
        return entries.reduce((groups, entry) => {
            const key = entry[field] || 'Sin especificar';
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }

    static formatForAEATExcel(bookData, companyData) {
        const {bookType, year, entries} = bookData;

        // Nombre del archivo según AEAT: YYYY_NIF_TIPO_NombreEmpresa.xlsx
        const fileName = `${year}_${companyData.nif}_${bookData.bookCode}_${companyData.name.replace(/\s+/g, '_')}.xlsx`;

        // Estructura según formato AEAT
        const excelData = {
            fileName,
            sheets: [{
                name: bookType === 'IVA_SOPORTADO' ? 'RECIBIDAS' : 'EXPEDIDAS',
                headers: this.getAEATHeaders(bookType),
                data: this.formatEntriesForExcel(entries, bookType)
            }],
            metadata: {
                generatedBy: 'Sistema de Gestión de Facturas',
                generatedAt: new Date().toISOString(),
                period: bookData.period,
                entryCount: entries.length
            }
        };

        return excelData;
    }

    static getAEATHeaders(bookType) {
        const commonHeaders = [
            'N. REGISTRO',
            'FECHA FACTURA',
            'NUMERO FACTURA',
            'NIF/CIF',
            'NOMBRE/RAZÓN SOCIAL',
            'BASE IMPONIBLE',
            'TIPO IVA',
            'CUOTA IVA',
            'TIPO IRPF',
            'CUOTA IRPF',
            'IMPORTE TOTAL'
        ];

        if (bookType === 'IVA_SOPORTADO') {
            return [
                ...commonHeaders,
                'DEDUCIBLE',
                'FECHA RECEPCIÓN',
                'CONCEPTO'
            ];
        } else {
            return [
                ...commonHeaders,
                'TIPO FACTURA',
                'FECHA VENCIMIENTO',
                'ESTADO COBRO'
            ];
        }
    }

    static filterRecordsByDate(records, year, quarter = null, month = null, dateField) {
        let filtered = records.filter(record => {
            const recordDate = new Date(record[dateField]);
            return recordDate.getFullYear() === year;
        });

        if (month) {
            filtered = filtered.filter(record => new Date(record[dateField]).getMonth() + 1 === month);
        } else if (quarter) {
            const quarterMonths = {1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12]};
            const monthsInQuarter = quarterMonths[quarter];
            filtered = filtered.filter(record => monthsInQuarter.includes(new Date(record[dateField]).getMonth() + 1));
        }
        return filtered;
    }

    static roundObjectValues(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'number') {
                obj[key] = parseFloat(obj[key].toFixed(2));
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.roundObjectValues(obj[key]);
            }
        }
    }

}