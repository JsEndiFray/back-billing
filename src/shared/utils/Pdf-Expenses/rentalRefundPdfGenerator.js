import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * Genera PDF para un abono de gasto de alquiler
 * @param {Object} refund - Datos del abono
 * @param {string} filePath - Ruta donde guardar el PDF
 */
export const generateExpensesRefundPdf = async (refund, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            // Pipe del documento al archivo
            doc.pipe(fs.createWriteStream(filePath));

            // ========================================
            // CABECERA DEL DOCUMENTO - ESTILO ABONO
            // ========================================
            doc.fontSize(22)
                .fillColor('#e74c3c')
                .text('COMPROBANTE DE ABONO', 50, 50, { align: 'center' });

            doc.fontSize(14)
                .fillColor('#c0392b')
                .text('(Rectificación de Gasto)', 50, 80, { align: 'center' });

            // Línea separadora roja
            doc.moveTo(50, 110)
                .lineTo(550, 110)
                .strokeColor('#e74c3c')
                .lineWidth(2)
                .stroke();

            // ========================================
            // INFORMACIÓN DEL ABONO
            // ========================================
            let yPosition = 140;

            // Número de abono
            if (refund.expense_number) {
                doc.fontSize(14)
                    .fillColor('#e74c3c')
                    .text(`Número de Abono: ${refund.expense_number}`, 50, yPosition, { underline: true });
                yPosition += 30;
            }

            // Referencia al gasto original
            if (refund.original_expense_id) {
                doc.fontSize(12)
                    .fillColor('#7f8c8d')
                    .text(`Gasto Original ID: ${refund.original_expense_id}`, 50, yPosition);

                if (refund.original_expense_number) {
                    doc.text(`Número Original: ${refund.original_expense_number}`, 300, yPosition);
                }
                yPosition += 25;
            }

            // Información básica
            doc.fontSize(12)
                .fillColor('#2c3e50')
                .text('INFORMACIÓN DEL ABONO', 50, yPosition, { underline: true });

            yPosition += 25;

            const basicInfo = [
                ['Tipo de Propiedad:', refund.property_type || 'N/A'],
                ['Nombre de Propiedad:', refund.property_name || 'N/A'],
                ['Fecha del Abono:', new Date(refund.date).toLocaleDateString('es-ES')],
                ['Motivo:', refund.notes || 'Rectificación de gasto']
            ];

            basicInfo.forEach(([label, value]) => {
                doc.fontSize(10)
                    .fillColor('#7f8c8d')
                    .text(label, 50, yPosition)
                    .fillColor('#2c3e50')
                    .text(value, 200, yPosition);
                yPosition += 20;
            });

            // ========================================
            // ADVERTENCIA SOBRE VALORES NEGATIVOS
            // ========================================
            yPosition += 10;

            doc.fontSize(11)
                .fillColor('#e74c3c')
                .rect(50, yPosition, 450, 40)
                .fillAndStroke('#fdf2f2', '#e74c3c')
                .fillColor('#c0392b')
                .text('⚠️ IMPORTANTE:', 60, yPosition + 8)
                .text('Los importes mostrados son NEGATIVOS para indicar la rectificación/devolución', 60, yPosition + 22);

            yPosition += 55;

            // ========================================
            // DESGLOSE DE ABONOS (VALORES NEGATIVOS)
            // ========================================
            doc.fontSize(12)
                .fillColor('#e74c3c')
                .text('DESGLOSE DE ABONOS', 50, yPosition, { underline: true });

            yPosition += 25;

            // Crear tabla de abonos
            const refunds = [
                ['Concepto', 'Importe Abonado (€)'],
                ['Alquiler Mensual', formatCurrency(refund.monthly_rent)],
                ['Electricidad', formatCurrency(refund.electricity)],
                ['Gas', formatCurrency(refund.gas)],
                ['Agua', formatCurrency(refund.water)],
                ['Gastos Comunidad', formatCurrency(refund.community_fees)],
                ['Seguro', formatCurrency(refund.insurance)],
                ['Impuesto Basuras', formatCurrency(refund.waste_tax)],
                ['Otros Gastos', formatCurrency(refund.others)]
            ];

            // Cabecera de la tabla (estilo rojo para abonos)
            doc.fontSize(10)
                .fillColor('#ffffff')
                .rect(50, yPosition, 450, 20)
                .fillAndStroke('#e74c3c', '#c0392b')
                .fillColor('#ffffff')
                .text('Concepto', 60, yPosition + 5)
                .text('Importe Abonado (€)', 350, yPosition + 5);

            yPosition += 20;

            // Filas de la tabla
            refunds.slice(1).forEach((row, index) => {
                const bgColor = index % 2 === 0 ? '#fdf2f2' : '#ffffff';

                doc.rect(50, yPosition, 450, 18)
                    .fillAndStroke(bgColor, '#fadbd8')
                    .fillColor('#2c3e50')
                    .text(row[0], 60, yPosition + 3)
                    .fillColor('#e74c3c')
                    .text(row[1], 400, yPosition + 3, { align: 'right', width: 90 });

                yPosition += 18;
            });

            // ========================================
            // TOTAL DEL ABONO (NEGATIVO)
            // ========================================
            const total = calculateTotal(refund);

            yPosition += 10;

            doc.fontSize(12)
                .fillColor('#ffffff')
                .rect(350, yPosition, 150, 25)
                .fillAndStroke('#c0392b', '#a93226')
                .fillColor('#ffffff')
                .text('TOTAL ABONADO:', 360, yPosition + 7)
                .text(formatCurrency(total), 420, yPosition + 7, { align: 'right', width: 70 });

            // ========================================
            // INSTRUCCIONES O NOTAS FINALES
            // ========================================
            yPosition += 50;

            doc.fontSize(10)
                .fillColor('#7f8c8d')
                .text('INSTRUCCIONES:', 50, yPosition, { underline: true });

            yPosition += 20;

            const instructions = [
                '• Este documento rectifica el gasto original mencionado',
                '• Los importes negativos indican devolución o anulación',
                '• Conserve este documento junto con el comprobante original',
                '• Para dudas, contacte con el departamento de administración'
            ];

            instructions.forEach(instruction => {
                doc.text(instruction, 50, yPosition);
                yPosition += 15;
            });

            // ========================================
            // PIE DE PÁGINA
            // ========================================
            const bottomY = 750;

            doc.fontSize(8)
                .fillColor('#95a5a6')
                .text(`Abono generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
                    50, bottomY, { align: 'center', width: 500 });

            // Finalizar el documento
            doc.end();

            // Resolver la promesa cuando termine
            doc.on('end', () => {
                resolve(filePath);
            });

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Calcula el total de todos los abonos
 */
function calculateTotal(refund) {
    const total =
        (parseFloat(refund.monthly_rent) || 0) +
        (parseFloat(refund.electricity) || 0) +
        (parseFloat(refund.gas) || 0) +
        (parseFloat(refund.water) || 0) +
        (parseFloat(refund.community_fees) || 0) +
        (parseFloat(refund.insurance) || 0) +
        (parseFloat(refund.waste_tax) || 0) +
        (parseFloat(refund.others) || 0);

    return total;
}

/**
 * Formatea números como moneda (manteniendo el signo negativo)
 */
function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(num);
}