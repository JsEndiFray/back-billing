/**
 * @fileoverview Generador de PDFs para facturas recibidas de proveedores
 *
 * Genera documentos PDF profesionales para facturas que recibimos de proveedores
 * con todos los datos del proveedor, empresa receptora e información fiscal.
 *
 * @requires pdfkit
 * @requires fs
 * @requires path
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Genera un PDF de factura recibida con formato profesional
 *
 * @param {Object} invoice - Objeto con todos los datos de la factura recibida
 * @param {string} outputPath - Ruta donde guardar el archivo PDF
 * @returns {Promise<string>} Promesa que resuelve con la ruta del archivo generado
 */
export const generateReceivedInvoicePdf = (invoice, outputPath) => {
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

            // ==========================================
            // CONFIGURACIÓN DEL DOCUMENTO
            // ==========================================

            const doc = new PDFDocument({margin: 50, size: 'A4'});
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Color principal - diferente para facturas recibidas
            const primaryColor = invoice.is_refund ? '#B22222' : '#2E8B57'; // Rojo para abonos, Verde para facturas normales
            const documentType = invoice.is_refund ? 'ABONO RECIBIDO' : 'FACTURA RECIBIDA';

            // ==========================================
            // ENCABEZADO PRINCIPAL
            // ==========================================

            // Barra de título
            doc.fillColor(primaryColor).rect(50, 50, 500, 40).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(18).text(documentType, 60, 60);

            // Referencia a factura original si es abono
            if (invoice.is_refund && invoice.original_invoice_number) {
                doc.fillColor('black').font('Helvetica-Bold').fontSize(10)
                    .text(`Referencia a factura: ${invoice.original_invoice_number}`, 60, 100);
            }

            doc.moveDown(2);

            // ==========================================
            // SECCIÓN DEL PROVEEDOR (COLUMNA IZQUIERDA)
            // ==========================================

            const leftColumnX = 50;
            const rightColumnX = 350;
            const startY = doc.y + 10;

            // Título de la sección proveedor
            doc.font('Helvetica-Bold').fillColor('black').fontSize(11).text('PROVEEDOR', leftColumnX, startY);
            doc.font('Helvetica').fillColor('black').fontSize(10).moveDown(0.3);

            // Datos del proveedor
            doc.text(`${invoice.supplier_name || invoice.supplier_company || 'N/A'}`, leftColumnX, doc.y);
            doc.text(`NIF/CIF: ${invoice.supplier_tax_id || 'N/A'}`, leftColumnX, doc.y + 5);

            // ==========================================
            // INFORMACIÓN DE LA FACTURA (COLUMNA DERECHA)
            // ==========================================

            // Número de factura
            doc.font('Helvetica-Bold').fontSize(10).text('Nº de factura', rightColumnX, startY, {width: 100});
            doc.font('Helvetica').text(invoice.invoice_number || 'N/A', rightColumnX + 100, startY);

            // Nuestra referencia
            doc.font('Helvetica-Bold').text('Nuestra referencia', rightColumnX, startY + 20, {width: 100});
            doc.font('Helvetica').text(invoice.our_reference || 'N/A', rightColumnX + 100, startY + 20);

            // Fecha de factura
            doc.font('Helvetica-Bold').text('Fecha factura', rightColumnX, startY + 40, {width: 100});
            const invoiceDate = invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('es-ES') : 'N/A';
            doc.font('Helvetica').text(invoiceDate, rightColumnX + 100, startY + 40);

            // Fecha de vencimiento
            doc.font('Helvetica-Bold').text('Fecha vencimiento', rightColumnX, startY + 60, {width: 100});
            const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('es-ES') : 'N/A';
            doc.font('Helvetica').text(dueDate, rightColumnX + 100, startY + 60);

            // Categoría
            doc.font('Helvetica-Bold').text('Categoría', rightColumnX, startY + 80, {width: 100});
            doc.font('Helvetica').text(invoice.category || 'N/A', rightColumnX + 100, startY + 80);

            // ==========================================
            // CÁLCULOS FISCALES
            // ==========================================

            const taxBase = safeNumber(invoice.tax_base);
            const ivaPercentage = safeNumber(invoice.iva_percentage);
            const irpfPercentage = safeNumber(invoice.irpf_percentage);
            const ivaAmount = safeNumber(invoice.iva_amount);
            const irpfAmount = safeNumber(invoice.irpf_amount);
            const total = safeNumber(invoice.total_amount);

            doc.moveDown(4);

            // ==========================================
            // TABLA DE CONCEPTOS
            // ==========================================

            const tableHeaderY = doc.y;
            doc.fillColor(primaryColor).rect(50, tableHeaderY, 500, 25).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(12).text('Descripción', 70, tableHeaderY + 7);
            doc.text('Categoría', 300, tableHeaderY + 7);
            doc.text('Importe', 480, tableHeaderY + 7, {align: 'right'});

            doc.y = tableHeaderY + 25;

            // Configuración de la tabla
            const tableLeft = 50;
            const descWidth = 220;
            const categoryWidth = 150;
            const priceWidth = 130;
            const rowHeight = 40;

            // Fila de datos
            const rowY = doc.y;

            // Bordes de las celdas
            doc.strokeColor('#cccccc').lineWidth(0.5);
            doc.rect(tableLeft, rowY, descWidth, rowHeight).stroke();
            doc.rect(tableLeft + descWidth, rowY, categoryWidth, rowHeight).stroke();
            doc.rect(tableLeft + descWidth + categoryWidth, rowY, priceWidth, rowHeight).stroke();

            // Contenido
            doc.fillColor('black').font('Helvetica').fontSize(10);

            // Descripción
            doc.text(
                invoice.description || 'Servicios varios',
                tableLeft + 10,
                rowY + 10,
                {width: descWidth - 20}
            );

            // Categoría
            doc.text(
                invoice.category || 'N/A',
                tableLeft + descWidth + 10,
                rowY + 10,
                {width: categoryWidth - 20}
            );

            // Importe
            doc.text(
                `${formatNumber(taxBase)} €`,
                tableLeft + descWidth + categoryWidth + 10,
                rowY + 10,
                {width: priceWidth - 20, align: 'right'}
            );

            doc.y = rowY + rowHeight;

            // ==========================================
            // RESUMEN ECONÓMICO
            // ==========================================

            doc.moveDown(3);

            const summaryX = 50;
            const summaryY = doc.y;

            // Base imponible
            doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text('Base Imponible', summaryX, summaryY);
            doc.font('Helvetica').text(`${formatNumber(taxBase)} €`, summaryX + 430, summaryY, {
                width: 70,
                align: 'right'
            });

            // IVA
            doc.font('Helvetica-Bold').text(`I.V.A. ${ivaPercentage}%`, summaryX, summaryY + 20);
            doc.font('Helvetica').text(`${formatNumber(ivaAmount)} €`, summaryX + 430, summaryY + 20, {
                width: 70,
                align: 'right'
            });

            // IRPF
            if (irpfPercentage > 0) {
                doc.font('Helvetica-Bold').text(`I.R.P.F. ${irpfPercentage}%`, summaryX, summaryY + 40);
                doc.font('Helvetica').text(`-${formatNumber(irpfAmount)} €`, summaryX + 430, summaryY + 40, {
                    width: 70,
                    align: 'right'
                });
            }

            // Línea separadora
            const lineY = irpfPercentage > 0 ? summaryY + 60 : summaryY + 40;
            doc.strokeColor('#cccccc').lineWidth(1).moveTo(summaryX, lineY).lineTo(summaryX + 500, lineY).stroke();

            // Total final
            const totalY = lineY + 10;
            const totalLabel = invoice.is_refund ? 'Total del abono' : 'Total de la factura';
            doc.font('Helvetica-Bold').text(totalLabel, summaryX, totalY);
            doc.font('Helvetica-Bold').text(`${formatNumber(total)} €`, summaryX + 430, totalY, {
                width: 70,
                align: 'right'
            });

            // ==========================================
            // ESTADO DE PAGO
            // ==========================================

            doc.moveDown(4);

            const paymentY = doc.y;
            doc.fillColor(primaryColor).rect(50, paymentY, 500, 25).fill();

            const paymentText = 'ESTADO DE PAGO';
            const textWidth = doc.widthOfString(paymentText);
            const centerX = 50 + (500 - textWidth) / 2;

            doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
                .text(paymentText, centerX, paymentY + 7);

            doc.y = paymentY + 30;

            // Estado actual
            doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text('Estado:', 50, doc.y);
            const statusLabels = {
                'pending': 'Pendiente',
                'paid': 'Pagado',
                'collected': 'Pagado',
                'overdue': 'Vencida',
                'disputed': 'Disputada'
            };
            const statusText = statusLabels[invoice.collection_status] || invoice.collection_status || 'Pendiente';
            doc.font('Helvetica').text(statusText, 150, doc.y);
            doc.moveDown(1);

            // Método de pago
            if (invoice.collection_method) {
                doc.font('Helvetica-Bold').text('Método de pago:', 50, doc.y);
                const methodLabels = {
                    'transfer': 'Transferencia',
                    'direct_debit': 'Domiciliación',
                    'cash': 'Efectivo',
                    'card': 'Tarjeta',
                    'check': 'Cheque'
                };
                const methodText = methodLabels[invoice.collection_method] || invoice.collection_method;
                doc.font('Helvetica').text(methodText, 150, doc.y);
                doc.moveDown(1);
            }

            // Fecha de pago
            if (invoice.collection_date) {
                doc.font('Helvetica-Bold').text('Fecha de pago:', 50, doc.y);
                const paymentDate = new Date(invoice.collection_date).toLocaleDateString('es-ES');
                doc.font('Helvetica').text(paymentDate, 150, doc.y);
                doc.moveDown(1);
            }

            // Referencia de pago
            if (invoice.collection_reference) {
                doc.font('Helvetica-Bold').text('Referencia:', 50, doc.y);
                doc.font('Helvetica').text(invoice.collection_reference, 150, doc.y);
                doc.moveDown(1);
            }

            // Notas
            if (invoice.notes || invoice.collection_notes) {
                doc.moveDown(1);
                doc.font('Helvetica-Bold').text('Notas:', 50, doc.y);
                const notes = invoice.collection_notes || invoice.notes;
                doc.font('Helvetica').text(notes, 50, doc.y + 15, {width: 500});
            }

            // Nota final
            doc.moveDown(2);
            const finalNote = invoice.is_refund
                ? 'Este documento es un abono (factura rectificativa) de la factura original referenciada.'
                : 'Documento generado automáticamente por el sistema de gestión.';

            doc.font('Helvetica-Oblique').fontSize(9)
                .text(finalNote, 50, doc.y, {align: 'center'});

            // ==========================================
            // FINALIZACIÓN DEL DOCUMENTO
            // ==========================================

            doc.end();

            // Manejo de eventos del stream
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', (error) => reject(error));

        } catch (error) {
            console.error('Error en generación de PDF:', error);
            reject(error);
        }
    });
};