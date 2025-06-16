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