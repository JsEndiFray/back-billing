import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * Genera PDF para un gasto de alquiler
 * 🔧 MEJORADO: Basado en el patrón del generador de facturas
 * @param {Object} expense - Datos del gasto
 * @param {string} filePath - Ruta donde guardar el PDF
 */
export const generateExpensePdf = (expense, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            /**
             * Convierte un valor a número seguro
             */
            const safeNumber = (value) => {
                if (value === null || value === undefined) return 0;
                return typeof value === 'number' ? value : parseFloat(value) || 0;
            };

            /**
             * Formatea un número con 2 decimales
             */
            const formatNumber = (value) => {
                return safeNumber(value).toFixed(2);
            };

            /**
             * Formatea números como moneda
             */
            const formatCurrency = (amount) => {
                const num = parseFloat(amount) || 0;
                return new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                }).format(num);
            };

            /**
             * Calcula el total de todos los gastos
             */
            const calculateTotal = (expense) => {
                return (
                    safeNumber(expense.monthly_rent) +
                    safeNumber(expense.electricity) +
                    safeNumber(expense.gas) +
                    safeNumber(expense.water) +
                    safeNumber(expense.community_fees) +
                    safeNumber(expense.insurance) +
                    safeNumber(expense.waste_tax) +
                    safeNumber(expense.others)
                );
            };

            // ==========================================
            // CONFIGURACIÓN DEL DOCUMENTO
            // ==========================================
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const primaryColor = '#e74c3c'; // Rojo para gastos
            const secondaryColor = '#c0392b';

            // ==========================================
            // ENCABEZADO PRINCIPAL
            // ==========================================
            doc.fillColor(primaryColor).rect(50, 50, 500, 40).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(22)
                .text('COMPROBANTE DE GASTO', 60, 60);

            // ==========================================
            // INFORMACIÓN DEL GASTO
            // ==========================================
            let yPosition = 120;

            // Número de gasto
            if (expense.expense_number) {
                doc.fontSize(14)
                    .fillColor('#2c3e50')
                    .text(`Número: ${expense.expense_number}`, 50, yPosition);
                yPosition += 30;
            }

            // Información básica
            doc.fontSize(12)
                .fillColor('#2c3e50')
                .text('INFORMACIÓN GENERAL', 50, yPosition, { underline: true });
            yPosition += 25;

            const basicInfo = [
                ['Tipo de Propiedad:', expense.property_type || 'N/A'],
                ['Nombre de Propiedad:', expense.property_name || 'N/A'],
                ['Fecha:', new Date(expense.date).toLocaleDateString('es-ES')],
                ['Estado de Pago:', expense.payment_status === 'paid' ? 'Pagado' : 'Pendiente']
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
            // INFORMACIÓN PROPORCIONAL (SI APLICA)
            // ========================================
            if (expense.is_proportional && expense.start_date && expense.end_date) {
                yPosition += 10;

                doc.fontSize(12)
                    .fillColor('#e67e22')
                    .text('FACTURACIÓN PROPORCIONAL', 50, yPosition, { underline: true });
                yPosition += 25;

                const startDate = new Date(expense.start_date);
                const endDate = new Date(expense.end_date);
                const startFormatted = startDate.toLocaleDateString('es-ES');
                const endFormatted = endDate.toLocaleDateString('es-ES');

                // Calcular días
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                const year = startDate.getFullYear();
                const month = startDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const percentage = ((diffDays / daysInMonth) * 100).toFixed(2);

                const proportionalInfo = [
                    ['Período:', `Del ${startFormatted} al ${endFormatted}`],
                    ['Días facturados:', `${diffDays} días de ${daysInMonth} días del mes`],
                    ['Porcentaje:', `${percentage}%`],
                    ['Mes correspondencia:', expense.corresponding_month || 'N/A']
                ];

                proportionalInfo.forEach(([label, value]) => {
                    doc.fontSize(10)
                        .fillColor('#7f8c8d')
                        .text(label, 50, yPosition)
                        .fillColor('#e67e22')
                        .text(value, 200, yPosition);
                    yPosition += 18;
                });
            }

            // ========================================
            // DESGLOSE DE GASTOS - TABLA PROFESIONAL
            // ========================================
            yPosition += 30;

            doc.fontSize(12)
                .fillColor('#2c3e50')
                .text('DESGLOSE DE GASTOS', 50, yPosition, { underline: true });
            yPosition += 25;

            // Encabezado de la tabla
            doc.fontSize(10)
                .fillColor('#ffffff')
                .rect(50, yPosition, 500, 25)
                .fillAndStroke(primaryColor, secondaryColor)
                .fillColor('#ffffff')
                .text('Concepto', 60, yPosition + 7)
                .text('Importe (€)', 450, yPosition + 7, { align: 'right' });

            yPosition += 25;

            // Datos de la tabla
            const expenseItems = [
                ['Alquiler Mensual', expense.monthly_rent],
                ['Electricidad', expense.electricity],
                ['Gas', expense.gas],
                ['Agua', expense.water],
                ['Gastos Comunidad', expense.community_fees],
                ['Seguro', expense.insurance],
                ['Impuesto Basuras', expense.waste_tax],
                ['Otros Gastos', expense.others]
            ];

            // Filas de la tabla
            expenseItems.forEach((item, index) => {
                const [concept, amount] = item;
                const value = safeNumber(amount);

                // Solo mostrar filas con valor > 0
                if (value > 0) {
                    const bgColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

                    doc.rect(50, yPosition, 500, 20)
                        .fillAndStroke(bgColor, '#dee2e6')
                        .fillColor('#2c3e50')
                        .text(concept, 60, yPosition + 5)
                        .text(formatCurrency(value), 450, yPosition + 5, { align: 'right' });

                    yPosition += 20;
                }
            });

            // ========================================
            // TOTAL
            // ========================================
            const total = calculateTotal(expense);
            yPosition += 10;

            doc.fontSize(14)
                .fillColor('#ffffff')
                .rect(350, yPosition, 200, 30)
                .fillAndStroke(secondaryColor, primaryColor)
                .fillColor('#ffffff')
                .text('TOTAL:', 360, yPosition + 8)
                .text(formatCurrency(total), 450, yPosition + 8, { align: 'right' });

            // ========================================
            // INFORMACIÓN DE PAGO
            // ========================================
            yPosition += 60;

            if (expense.payment_status || expense.payment_method) {
                doc.fontSize(12)
                    .fillColor('#2c3e50')
                    .text('INFORMACIÓN DE PAGO', 50, yPosition, { underline: true });
                yPosition += 25;

                const paymentInfo = [
                    ['Estado:', expense.payment_status === 'paid' ? 'Pagado' : 'Pendiente'],
                    ['Método:', expense.payment_method || 'No especificado'],
                    ['Fecha de pago:', expense.payment_date ? new Date(expense.payment_date).toLocaleDateString('es-ES') : 'N/A'],
                    ['Notas:', expense.payment_notes || 'Sin notas']
                ];

                paymentInfo.forEach(([label, value]) => {
                    doc.fontSize(10)
                        .fillColor('#7f8c8d')
                        .text(label, 50, yPosition)
                        .fillColor('#2c3e50')
                        .text(value, 150, yPosition);
                    yPosition += 18;
                });
            }

            // ========================================
            // NOTAS ADICIONALES
            // ========================================
            if (expense.notes) {
                yPosition += 20;

                doc.fontSize(12)
                    .fillColor('#2c3e50')
                    .text('NOTAS', 50, yPosition, { underline: true });
                yPosition += 20;

                doc.fontSize(10)
                    .fillColor('#7f8c8d')
                    .text(expense.notes, 50, yPosition, { width: 500 });
            }

            // ========================================
            // INFORMACIÓN DE ABONO (SI ES UN ABONO)
            // ========================================
            if (expense.is_refund && expense.original_expense_id) {
                yPosition += 40;

                doc.fontSize(12)
                    .fillColor('#e74c3c')
                    .text('⚠️ DOCUMENTO DE ABONO', 50, yPosition, { underline: true });
                yPosition += 25;

                doc.fontSize(10)
                    .fillColor('#7f8c8d')
                    .text(`Este documento corresponde a un abono del gasto original ID: ${expense.original_expense_id}`, 50, yPosition)
                    .text('Los importes mostrados son negativos para indicar la rectificación.', 50, yPosition + 15);
            }

            // ========================================
            // PIE DE PÁGINA
            // ========================================
            const bottomY = 750;

            doc.fontSize(8)
                .fillColor('#95a5a6')
                .text(`Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
                    50, bottomY, { align: 'center', width: 500 });

            // ==========================================
            // FINALIZACIÓN DEL DOCUMENTO (PATRÓN CORRECTO)
            // ==========================================
            doc.end();

            // Manejo de eventos del stream (IGUAL QUE EN invoicePdfGenerator.js)
            stream.on('finish', () => {
                console.log('✅ Stream finalizado correctamente');
                resolve(filePath);
            });

            stream.on('error', (error) => {
                console.error('❌ Error en stream:', error);
                reject(error);
            });

        } catch (error) {
            console.error('❌ Error en generación de PDF:', error);
            reject(error);
        }
    });
};