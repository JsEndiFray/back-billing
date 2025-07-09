import { calculateTotal, calculateProportionalTotal } from "./calculateTotal.js";

/**
 * Helper específico para lógica de facturación proporcional
 * Separado del BillsService para mejor organización y reutilización
 */
export class ProportionalBillingHelper {

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
                total: calculateTotal(tax_base, iva, irpf),
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
        const proportionalResult = calculateProportionalTotal(tax_base, iva, irpf, start_date, end_date);

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
        const { is_proportional, start_date, end_date } = billData;

        // Si NO es proporcional, no validar fechas
        if (!is_proportional) {
            return { isValid: true, message: '' };
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

        return { isValid: true, message: '' };
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

        const calculation = this.calculateBillTotal(billData);
        return {
            type: 'proportional',
            ...calculation.details
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

        // Calcular días
        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysBilled = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

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
}