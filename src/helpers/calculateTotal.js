/**
 * Calculadora de totales fiscales para facturación española
 *
 * Calcula el total final de una factura aplicando IVA (impuesto sobre el valor añadido)
 * e IRPF (impuesto sobre la renta de las personas físicas) sobre una base imponible.
 *
 * La fórmula aplicada es: Total = Base + (Base × IVA%) - (Base × IRPF%)
 *
 * @param {string|number} tax_base - Base imponible sobre la que calcular los impuestos
 * @param {string|number} iva - Porcentaje de IVA a aplicar (ej: 21 para 21%)
 * @param {string|number} irpf - Porcentaje de IRPF a aplicar (ej: 15 para 15%)
 * @returns {number} Total calculado redondeado a 2 decimales
 *
 * @example
 * // Factura de 1000€ con IVA del 21% y IRPF del 15%
 * const total = calculateTotal(1000, 21, 15);
 * console.log(total); // 1060.00
 *
 * @example
 * // Con strings como parámetros
 * const total = calculateTotal("500", "10", "7");
 * console.log(total); // 515.00
 *
 * @example
 * // Con valores inválidos (se tratan como 0)
 * const total = calculateTotal("", null, undefined);
 * console.log(total); // 0.00
 *
 * @since 1.0.0
 * @author Tu Nombre
 */
export function calculateTotal(tax_base, iva, irpf) {
    // Convierte los parámetros a números, usando 0 como valor por defecto
    const base = parseFloat(tax_base) || 0;
    const ivaPercent = parseFloat(iva) || 0;
    const irpfPercent = parseFloat(irpf) || 0;
    // Aplica la fórmula fiscal española
    const total = base + (base * ivaPercent / 100) - (base * irpfPercent / 100);

    // Redondea a 2 decimales para evitar problemas de precisión
    return parseFloat(total.toFixed(2));
}

/**
 * 🆕 Calcula el total de forma proporcional por días
 *
 * @param {number} tax_base - Base imponible del mes completo
 * @param {number} iva - Porcentaje de IVA
 * @param {number} irpf - Porcentaje de IRPF
 * @param {string} start_date - Fecha inicio (YYYY-MM-DD)
 * @param {string} end_date - Fecha fin (YYYY-MM-DD)
 * @returns {Object} Objeto con base proporcional, IVA, IRPF y total
 *
 * @example
 * // Cliente se incorpora el 17 de julio (del 17 al 31)
 * const result = calculateProportionalTotal(1000, 21, 15, '2025-07-17', '2025-07-31');
 * // Resultado: 15 días de 31 = 48.39% del mes
 */

export function calculateProportionalTotal(tax_base, iva, irpf, start_date, end_date) {
    // 1️⃣ VALIDAR DATOS DE ENTRADA
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
    // 2️⃣ CONVERTIR FECHAS
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // 3️⃣ CALCULAR DÍAS FACTURADOS (inclusivo)
    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysBilled = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; // +1 para incluir ambos días

    // 4️⃣ CALCULAR DÍAS DEL MES (del mes donde está la fecha de inicio)
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Último día del mes

    // 5️⃣ CALCULAR PROPORCIÓN
    const proportion = daysBilled / daysInMonth;
    const proportionPercentage = Math.round(proportion * 100 * 100) / 100; // Redondear a 2 decimales

    // 6️⃣ APLICAR PROPORCIÓN A LA BASE IMPONIBLE
    const proportionalBase = base * proportion;

    // 7️⃣ CALCULAR IVA E IRPF SOBRE LA BASE PROPORCIONAL
    const ivaAmount = proportionalBase * ivaPercent / 100;
    const irpfAmount = proportionalBase * irpfPercent / 100;

    // 8️⃣ CALCULAR TOTAL FINAL
    const total = proportionalBase + ivaAmount - irpfAmount;

    // 9️⃣ RETORNAR OBJETO COMPLETO CON TODOS LOS DETALLES
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
 * 🆕 Función auxiliar para obtener los días de un mes específico
 *
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {number} Número de días del mes
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * 🆕 Función auxiliar para calcular días entre dos fechas
 *
 * @param {string} start_date - Fecha inicio (YYYY-MM-DD)
 * @param {string} end_date - Fecha fin (YYYY-MM-DD)
 * @returns {number} Número de días (inclusivo)
 */
export function calculateDaysBetween(start_date, end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const timeDifference = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
}