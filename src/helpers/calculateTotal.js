export function calculateTotal(tax_base, iva, irpf) {
    const base = parseFloat(tax_base) || 0;
    const ivaPercent = parseFloat(iva) || 0;
    const irpfPercent = parseFloat(irpf) || 0;

    const total = base + (base * ivaPercent / 100) - (base * irpfPercent / 100);
    return parseFloat(total.toFixed(2)); // Redondea a 2 decimales
}