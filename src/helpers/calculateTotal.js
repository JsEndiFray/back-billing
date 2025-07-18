/**
 * HELPER PARA CÁLCULOS DE FACTURAS
 *
 * ¿Qué hace este archivo?
 * - Calcula totales de facturas aplicando impuestos españoles (IVA e IRPF)
 * - Maneja cálculos proporcionales por días (para facturas parciales)
 * - Valida fechas y rangos de tiempo
 * - Genera descripciones legibles de períodos
 *
 * 💡 Conceptos importantes:
 * - IVA: Impuesto que se SUMA al total (el cliente paga más)
 * - IRPF: Retención que se RESTA del total (se descuenta)
 * - Base imponible: Cantidad sobre la que se calculan los impuestos
 * - Proporcional: Facturar solo los días que corresponden (no el mes completo)
 */
export default class CalculateHelper {

    // ===========================================
    // CÁLCULOS BÁSICOS DE FACTURAS
    // ===========================================

    /**
     * 💰 Calcula el total de una factura con impuestos españoles
     *
     * Fórmula: Total = Base + (Base × IVA%) - (Base × IRPF%)
     *
     * Ejemplo práctico:
     * - Base: 1000€
     * - IVA 21%: +210€ (el cliente paga más)
     * - IRPF 15%: -150€ (retención fiscal)
     * - Total: 1000 + 210 - 150 = 1060€
     *
     * @param {string|number} tax_base - Base imponible (cantidad sin impuestos)
     * @param {string|number} iva - Porcentaje de IVA (ej: 21 para 21%)
     * @param {string|number} irpf - Porcentaje de IRPF (ej: 15 para 15%)
     * @returns {number} Total calculado con 2 decimales
     */
    static calculateTotal(tax_base, iva, irpf) {
        // Convierte los parámetros a números, usando 0 como valor por defecto
        const base = parseFloat(tax_base) || 0;
        const ivaPercent = parseFloat(iva) || 0;
        const irpfPercent = parseFloat(irpf) || 0;
        // Aplica la fórmula fiscal española
        const total = base + (base * ivaPercent / 100) - (base * irpfPercent / 100);

        // Redondea a 2 decimales para evitar problemas de precisión
        return parseFloat(total.toFixed(2));
    }

    // ===========================================
    // 📅 CÁLCULOS PROPORCIONALES POR DÍAS
    // ===========================================

    /**
     * 📅 Calcula factura proporcional por días
     *
     * ¿Cuándo usar esto?
     * - Cliente se muda a mitad de mes
     * - Inquilino se va el día 15
     * - Solo facturar los días que realmente corresponden
     *
     * Ejemplo: Cliente se va el 15 de julio
     * - Mes completo: 31 días
     * - Solo facturar: del 1 al 15 = 15 días
     * - Proporción: 15/31 = 48.39% del mes
     *
     * @param {number} tax_base - Base imponible del mes completo
     * @param {number} iva - Porcentaje de IVA
     * @param {number} irpf - Porcentaje de IRPF
     * @param {string} start_date - Fecha inicio (YYYY-MM-DD)
     * @param {string} end_date - Fecha fin (YYYY-MM-DD)
     * @returns {Object} Objeto con detalles completos del cálculo
     */
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
                total: calculateTotal(base, ivaPercent, irpfPercent)
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

    /**
     * Función auxiliar para obtener los días de un mes específico
     *
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {number} Número de días del mes
     */
    static getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    /**
     * 🆕 Función auxiliar para calcular días entre dos fechas
     *
     * @param {string} start_date - Fecha inicio (YYYY-MM-DD)
     * @param {string} end_date - Fecha fin (YYYY-MM-DD)
     * @returns {number} Número de días (inclusivo)
     */
    static calculateDaysBetween(start_date, end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const timeDifference = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
    }


    /**
     * Calcula el total de una factura (normal o proporcional)
     * @param {Object} billData - Datos de la factura
     * @returns {Object} Objeto con totales calculados y detalles
     */
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

    /**
     * Genera el mes de correspondencia automáticamente
     * @param {string} date - Fecha de la factura (YYYY-MM-DD)
     * @param {string} corresponding_month - Mes manual (opcional)
     * @returns {string} Mes de correspondencia (YYYY-MM)
     */
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

    /**
     * Valida los campos de facturación proporcional
     * @param {Object} billData - Datos de la factura
     * @returns {Object} {isValid: boolean, message: string}
     */
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

    /**
     * 🆕 Calcula el total de gastos (normal o proporcional)
     * Similar a calculateBillTotal pero para expenses
     * @param {Object} expenseData - Datos del gasto
     * @returns {Object} Objeto con totales calculados y detalles
     */
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

    /**
     * Valida si un rango de fechas es válido para facturación proporcional
     * @param {string} start_date - Fecha inicio (YYYY-MM-DD)
     * @param {string} end_date - Fecha fin (YYYY-MM-DD)
     * @returns {Object} {isValid: boolean, message: string, daysBilled?: number}
     */
    static validateDateRange(start_date, end_date) {
        if (!start_date || !end_date) {
            return {
                isValid: false,
                message: 'Fechas de inicio y fin son requeridas'
            };
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate >= endDate) {
            return {
                isValid: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            };
        }

        const daysBilled = this.calculateDaysBetween(start_date, end_date);

        return {
            isValid: true,
            message: 'Rango de fechas válido',
            daysBilled: daysBilled
        };
    }

    /**
     * Genera descripción legible del periodo facturado
     * @param {string} start_date - Fecha inicio (YYYY-MM-DD)
     * @param {string} end_date - Fecha fin (YYYY-MM-DD)
     * @returns {string} Descripción del periodo
     */
    static generatePeriodDescription(start_date, end_date) {
        if (!start_date || !end_date) {
            return 'Mes completo';
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        const startDay = startDate.getDate();
        const endDay = endDate.getDate();

        const monthNames = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        const monthName = monthNames[startDate.getMonth()];
        const year = startDate.getFullYear();

        return `Del ${startDay} al ${endDay} de ${monthName} ${year}`;
    }

    /**
     * Obtiene detalles de cálculo de una factura proporcional
     * @param {Object} billData - Datos de la factura
     * @returns {Object} Detalles del cálculo proporcional
     */
    static getCalculationDetails(billData) {
        if (!billData.is_proportional) {
            return {
                type: 'normal',
                message: 'Esta factura usa cálculo normal (mes completo)'
            };
        }

        const calculation = calculateBillTotal(billData);
        return {
            type: 'proportional',
            ...calculation.details
        };
    }

    /**
     * 🆕 Extrae año y mes de una fecha en formato numérico
     * Función auxiliar para evitar duplicar código en services
     * @param {string} date - Fecha (YYYY-MM-DD)
     * @returns {Object} {year: number, month: number}
     */
    static extractYearMonth(date) {
        if (!date) return {year: null, month: null};

        const dateObj = new Date(date);
        return {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1
        };
    }

    /**
     * Suma simple de todos los campos monetarios de un gasto
     * Método auxiliar para sumar campos individuales
     * @param {Object} expenseData - Datos del gasto/abono
     * @returns {number} Total calculado
     */
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

}
/**
 * 📚 CONCEPTOS CLAVE PARA ENTENDER ESTE ARCHIVO:
 *
 * 🏦 IMPUESTOS ESPAÑOLES:
 * - IVA: Se suma al total (el cliente paga más)
 * - IRPF: Se resta del total (retención fiscal)
 *
 * 📅 FACTURACIÓN PROPORCIONAL:
 * - Normal: Se factura el mes completo
 * - Proporcional: Se factura solo los días que corresponden
 * - Útil cuando alguien se muda a mitad de mes
 *
 * 🧮 PRECISIÓN DECIMAL:
 * - Siempre usar .toFixed(2) para evitar errores de redondeo
 * - JavaScript tiene problemas con decimales (0.1 + 0.2 ≠ 0.3)
 *
 * 💡 PATRÓN USADO:
 * - Helper class con métodos estáticos
 * - Funciones pequeñas y especializadas
 * - Validaciones separadas de cálculos
 * - Funciones auxiliares para reutilizar código
 */