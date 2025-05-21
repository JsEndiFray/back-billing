import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// ====================================================
// FUNCIÓN PRINCIPAL PARA GENERAR PDF DE UN ABONO
// ====================================================
export const generateRefundPdf = (bill, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            // --------------------------------------------
            // FUNCIONES AUXILIARES
            // --------------------------------------------
            const safeNumber = (value) => {
                if (value === null || value === undefined) return 0;
                return typeof value === 'number' ? value : parseFloat(value) || 0;
            };

            const formatNumber = (value) => {
                return safeNumber(value).toFixed(2);
            };

            // --------------------------------------------
            // CREACIÓN DEL DOCUMENTO PDF Y COLORES
            // --------------------------------------------
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Usamos rojo para abonos para destacar que es un documento especial
            const primaryColor = '#B22222'; // Rojo oscuro

            // --------------------------------------------
            // BARRA DE TÍTULO "FACTURA DE ABONO"
            // --------------------------------------------
            doc.fillColor(primaryColor).rect(50, 50, 500, 40).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(22).text('FACTURA DE ABONO', 60, 60);
            doc.moveDown(1);

            // Referencia a factura original
            doc.fillColor('black').font('Helvetica-Bold').fontSize(11)
                .text(`Referencia a factura: ${bill.original_bill_number || 'N/A'}`, 50, doc.y);
            doc.moveDown(1);

            // --------------------------------------------
            // DATOS DEL PROPIETARIO (IZQUIERDA)
            // --------------------------------------------
            const leftColumnX = 50;
            const rightColumnX = 350;
            const startY = doc.y + 10;

            doc.font('Helvetica-Bold').fillColor('black').fontSize(11).text('ARRENDADOR', leftColumnX, startY);
            doc.font('Helvetica').fillColor('black').fontSize(10).moveDown(0.3);

            doc.text(`${bill.owner_name || ''} ${bill.owner_lastname || ''}`, leftColumnX, doc.y);
            doc.text(`NIF: ${bill.owner_identification || 'N/A'}`, leftColumnX, doc.y + 5);
            doc.text(`${bill.owner_address || 'N/A'}`, leftColumnX, doc.y + 5);

            let locationText = '';
            if (bill.owner_postal_code) locationText += bill.owner_postal_code + '- ';
            if (bill.owner_location) locationText += bill.owner_location;
            if (locationText.trim()) doc.text(locationText, leftColumnX, doc.y + 5);

            // --------------------------------------------
            // DATOS DEL CLIENTE (DERECHA)
            // --------------------------------------------
            doc.font('Helvetica-Bold').fontSize(10).text('Nº de abono', rightColumnX, startY, { width: 100 });
            // Número de factura de abono centrado
            doc.font('Helvetica').text(bill.bill_number || 'N/A', rightColumnX + 120, startY);

            doc.font('Helvetica-Bold').text('Arrendatario', rightColumnX, doc.y + 5, { width: 100 });
            const clientName = bill.client_company_name || `${bill.client_name || ''} ${bill.client_lastname || ''}`;
            doc.font('Helvetica').text(clientName, rightColumnX + 100, doc.y - doc.currentLineHeight());

            doc.font('Helvetica-Bold').text('NIF', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_identification || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            doc.font('Helvetica-Bold').text('Dirección', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_address || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            doc.font('Helvetica-Bold').text('Código Postal', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_postal_code || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            doc.font('Helvetica-Bold').text('Localidad', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_location || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            doc.font('Helvetica-Bold').text('Provincia', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_province || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // --------------------------------------------
            // CÁLCULOS ECONÓMICOS
            // --------------------------------------------
            const taxBase = safeNumber(bill.tax_base); // Ya es negativo
            const iva = safeNumber(bill.iva);
            const irpf = safeNumber(bill.irpf);
            const ivaAmount = taxBase * iva / 100;
            const irpfAmount = taxBase * irpf / 100;
            const total = safeNumber(bill.total); // Ya es negativo

            doc.moveDown(2);

            // --------------------------------------------
            // ENCABEZADO DE TABLA - Color rojo
            // --------------------------------------------
            const tableHeaderY = doc.y;
            doc.fillColor(primaryColor).rect(50, tableHeaderY, 500, 25).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(12).text('Fecha', 70, tableHeaderY + 7);
            doc.text('Descripción', 240, tableHeaderY + 7);
            doc.text('Importe', 490, tableHeaderY + 7, { align: 'right' });

            // Actualizamos la posición Y para el contenido de la tabla
            doc.y = tableHeaderY + 25;

            // --------------------------------------------
            // TABLA DE CONCEPTOS (FECHA - DESCRIPCIÓN - IMPORTE)
            // --------------------------------------------
            const tableLeft = 50;
            const dateWidth = 80;     //Reducir el ancho de la fecha (de 150 a 100)
            const descWidth = 340;     //Aumentar el ancho de la descripción (de 270 a 320)
            const priceWidth = 80;     //Mantener el ancho del importe
            const rowHeight = 30;

            // Fila de datos (contenido de la tabla)
            const rowY = doc.y;

            // Dibujamos los bordes de la celda
            doc.strokeColor('#cccccc').lineWidth(0.5);
            doc.rect(tableLeft, rowY, dateWidth, rowHeight).stroke();
            doc.rect(tableLeft + dateWidth, rowY, descWidth, rowHeight).stroke();
            doc.rect(tableLeft + dateWidth + descWidth, rowY, priceWidth, rowHeight).stroke();

            // Escribimos los datos dentro de cada celda
            doc.fillColor('black').font('Helvetica').fontSize(10);

            // Fecha
            doc.text(
                bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A',
                tableLeft + 10,
                rowY + 10,
                { width: dateWidth - 20 }
            );

            // Descripción
            doc.text(
                `Abono por rectificación de factura ${bill.original_bill_number || ''} - ${bill.estate_address || 'N/A'}`,
                tableLeft + dateWidth + 10,
                rowY + 10,
                { width: descWidth - 20 }
            );

            // Importe (negativo)
            doc.text(
                `${formatNumber(taxBase)} €`,
                tableLeft + dateWidth + descWidth + 10,
                rowY + 10,
                { width: priceWidth - 20, align: 'right' }
            );

            // Actualizamos la posición Y para el siguiente elemento
            doc.y = rowY + rowHeight;

            // --------------------------------------------
            // RESUMEN ECONÓMICO (PARTE INFERIOR)
            // --------------------------------------------
            doc.moveDown(3);
            const summaryX = 50;
            const summaryY = doc.y;

            doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text('Base Imponible', summaryX, summaryY);
            doc.font('Helvetica').text(`${formatNumber(taxBase)} €`, summaryX + 430, summaryY, { width: 70, align: 'right' });

            doc.font('Helvetica-Bold').text(`I.V.A. ${iva}%`, summaryX, summaryY + 20);
            doc.font('Helvetica').text(`${formatNumber(ivaAmount)} €`, summaryX + 430, summaryY + 20, { width: 70, align: 'right' });

            doc.font('Helvetica-Bold').text(`I.R.P.F. ${irpf}%`, summaryX, summaryY + 40);
            doc.font('Helvetica').text(`-${formatNumber(irpfAmount)} €`, summaryX + 430, summaryY + 40, { width: 70, align: 'right' });

            doc.strokeColor('#cccccc').lineWidth(1).moveTo(summaryX, summaryY + 60).lineTo(summaryX + 500, summaryY + 60).stroke();

            doc.font('Helvetica-Bold').text('Total del abono', summaryX, summaryY + 70);
            doc.font('Helvetica-Bold').text(`${formatNumber(total)} €`, summaryX + 430, summaryY + 70, { width: 70, align: 'right' });

            // --------------------------------------------
            // FORMAS DE PAGO (NUEVA SECCIÓN)
            // --------------------------------------------
            doc.moveDown(4);
            const paymentY = doc.y;

            // Encabezado de formas de pago con el mismo color rojo
            doc.fillColor(primaryColor).rect(50, paymentY, 500, 25).fill();

            // Título "FORMA DE PAGO" centrado en la barra roja
            const formaPagoText = 'FORMA DE PAGO';
            const textWidth = doc.widthOfString(formaPagoText);
            const centerX = 50 + (500 - textWidth) / 2;

            doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
                .text(formaPagoText, centerX, paymentY + 7);

            doc.y = paymentY + 30;

            // Información de pago en filas
            doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text('Método de pago:', 50, doc.y);
            doc.font('Helvetica').text('Transferencia bancaria', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Entidad bancaria:', 50, doc.y);
            doc.font('Helvetica').text('BBVA', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Titular de la cuenta:', 50, doc.y);
            doc.font('Helvetica').text(bill.account_holder || bill.owner_name + ' ' + bill.owner_lastname || 'N/A', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Número de cuenta (IBAN):', 50, doc.y);
            doc.font('Helvetica').text('ES12 3456 7890 1234 5678 9012', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Concepto:', 50, doc.y);
            doc.font('Helvetica').text(`Abono ${bill.bill_number || 'N/A'}`, 150, doc.y);

            // Nota final
            doc.moveDown(2);
            doc.font('Helvetica-Oblique').fontSize(9)
                .text('Este documento es una factura rectificativa (abono) de la factura original referenciada.', 50, doc.y, { align: 'center' });

            // --------------------------------------------
            // FINALIZACIÓN
            // --------------------------------------------
            doc.end();
            stream.on('finish', () => resolve(outputPath));
            stream.on('error', (error) => reject(error));

        } catch (error) {
            console.error('Error en generación de PDF de abono:', error);
            reject(error);
        }
    });
};