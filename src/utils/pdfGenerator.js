/**
 * @fileoverview Generador de PDFs para facturas de alquiler
 *
 * Genera documentos PDF profesionales para facturas de alquiler con
 * todos los datos del arrendador, arrendatario, inmueble e información
 * fiscal. Incluye cálculos automáticos de IVA e IRPF.
 *
 * @requires pdfkit
 * @requires fs
 * @requires path
 * @author Tu Nombre
 * @since 1.0.0
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Genera un PDF de factura de alquiler con formato profesional
 *
 * Crea un documento PDF completo que incluye:
 * - Datos del arrendador (propietario) con teléfono
 * - Datos del arrendatario (cliente) con teléfono
 * - Información fiscal (IVA, IRPF, totales)
 * - Tabla de conceptos detallada
 * - Información de pago y transferencia bancaria
 *
 * @async
 * @function generateBillPdf
 * @param {Object} bill - Objeto con todos los datos de la factura
 * @param {string} bill.bill_number - Número de la factura
 * @param {string} bill.owner_name - Nombre del propietario
 * @param {string} bill.owner_lastname - Apellidos del propietario
 * @param {string} bill.owner_identification - NIF/CIF del propietario
 * @param {string} bill.owner_phone - Teléfono del propietario
 * @param {string} bill.owner_address - Dirección del propietario
 * @param {string} bill.client_name - Nombre del cliente
 * @param {string} bill.client_lastname - Apellidos del cliente
 * @param {string} bill.client_identification - NIF/CIF del cliente
 * @param {string} bill.client_phone - Teléfono del cliente
 * @param {string} bill.client_company_name - Nombre de empresa del cliente
 * @param {number} bill.tax_base - Base imponible
 * @param {number} bill.iva - Porcentaje de IVA
 * @param {number} bill.irpf - Porcentaje de IRPF
 * @param {number} bill.total - Total calculado
 * @param {string} outputPath - Ruta donde guardar el archivo PDF
 * @returns {Promise<string>} Promesa que resuelve con la ruta del archivo generado
 *
 * @example
 * const bill = {
 *   bill_number: "FACT-0001",
 *   owner_name: "Juan",
 *   owner_lastname: "Pérez",
 *   owner_identification: "12345678Z",
 *   owner_phone: "666777000",
 *   client_name: "María",
 *   client_lastname: "García",
 *   client_identification: "87654321Y",
 *   client_phone: "666777234",
 *   tax_base: 1000,
 *   iva: 21,
 *   irpf: 15,
 *   total: 1060
 * };
 *
 * try {
 *   const pdfPath = await generateBillPdf(bill, './factura.pdf');
 *   console.log('PDF generado:', pdfPath);
 * } catch (error) {
 *   console.error('Error generando PDF:', error);
 * }
 *
 * @throws {Error} Si hay problemas escribiendo el archivo o datos inválidos
 */
export const generateBillPdf = (bill, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            /**
             * Convierte un valor a número seguro
             * @private
             * @param {any} value - Valor a convertir
             * @returns {number} Número válido o 0
             */
            const safeNumber = (value) => {
                if (value === null || value === undefined) return 0;
                return typeof value === 'number' ? value : parseFloat(value) || 0;
            };

            /**
             * Formatea un número con 2 decimales
             * @private
             * @param {number} value - Valor a formatear
             * @returns {string} Número formateado con 2 decimales
             */
            const formatNumber = (value) => {
                return safeNumber(value).toFixed(2);
            };

            // ==========================================
            // CONFIGURACIÓN DEL DOCUMENTO
            // ==========================================

            /** @type {PDFDocument} Documento PDF principal */
            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            /** @type {fs.WriteStream} Stream de escritura del archivo */
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            /** @type {string} Color principal para headers y elementos destacados */
            const primaryColor = '#3366a9'; // Azul profesional

            // ==========================================
            // ENCABEZADO PRINCIPAL
            // ==========================================

            // Barra de título con fondo azul
            doc.fillColor(primaryColor).rect(50, 50, 500, 40).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(22).text('FACTURA', 60, 60);
            doc.moveDown(1);

            // ==========================================
            // SECCIÓN DEL ARRENDADOR (COLUMNA IZQUIERDA)
            // ==========================================

            /** @type {number} Posición X de la columna izquierda */
            const leftColumnX = 50;

            /** @type {number} Posición X de la columna derecha */
            const rightColumnX = 350;

            /** @type {number} Posición Y inicial para ambas columnas */
            const startY = doc.y + 10;

            // Título de la sección arrendador
            doc.font('Helvetica-Bold').fillColor('black').fontSize(11).text('ARRENDADOR', leftColumnX, startY);
            doc.font('Helvetica').fillColor('black').fontSize(10).moveDown(0.3);

            // Datos del propietario/arrendador
            doc.text(`${bill.owner_name || ''} ${bill.owner_lastname || ''}`, leftColumnX, doc.y);
            doc.text(`NIF: ${bill.owner_identification || 'N/A'}`, leftColumnX, doc.y + 5);
            doc.text(`Teléfono: ${bill.owner_phone || 'N/A'}`, leftColumnX, doc.y + 5);
            doc.text(`${bill.owner_address || 'N/A'}`, leftColumnX, doc.y + 5);

            // Formato de ubicación (código postal + localidad)
            let locationText = '';
            if (bill.owner_postal_code) locationText += bill.owner_postal_code + '- ';
            if (bill.owner_location) locationText += bill.owner_location;
            if (locationText.trim()) doc.text(locationText, leftColumnX, doc.y + 5);

            // ==========================================
            // SECCIÓN DEL ARRENDATARIO (COLUMNA DERECHA)
            // ==========================================

            // Número de factura
            doc.font('Helvetica-Bold').fontSize(10).text('Nº de factura', rightColumnX, startY, { width: 100 });
            doc.font('Helvetica').text(bill.bill_number || 'N/A', rightColumnX + 100, startY);

            // Nombre del arrendatario (empresa o persona física)
            doc.font('Helvetica-Bold').text('Arrendatario', rightColumnX, doc.y + 5, { width: 100 });
            const clientName = bill.client_company_name || `${bill.client_name || ''} ${bill.client_lastname || ''}`;
            doc.font('Helvetica').text(clientName, rightColumnX + 100, doc.y - doc.currentLineHeight());

            // NIF del cliente
            doc.font('Helvetica-Bold').text('NIF', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_identification || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Teléfono del cliente
            doc.font('Helvetica-Bold').text('Teléfono', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_phone || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Dirección del cliente
            doc.font('Helvetica-Bold').text('Dirección', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_address || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Código postal del cliente
            doc.font('Helvetica-Bold').text('Código Postal', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_postal_code || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Localidad del cliente
            doc.font('Helvetica-Bold').text('Localidad', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_location || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Provincia del cliente
            doc.font('Helvetica-Bold').text('Provincia', rightColumnX, doc.y + 5, { width: 100 });
            doc.font('Helvetica').text(bill.client_province || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // ==========================================
            // CÁLCULOS FISCALES
            // ==========================================

            /** @type {number} Base imponible de la factura */
            const taxBase = safeNumber(bill.tax_base);

            /** @type {number} Porcentaje de IVA */
            const iva = safeNumber(bill.iva);

            /** @type {number} Porcentaje de IRPF */
            const irpf = safeNumber(bill.irpf);

            /** @type {number} Importe del IVA calculado */
            const ivaAmount = taxBase * iva / 100;

            /** @type {number} Importe del IRPF calculado */
            const irpfAmount = taxBase * irpf / 100;

            /** @type {number} Total final de la factura */
            const total = safeNumber(bill.total);

            doc.moveDown(2);

            // ==========================================
            // TABLA DE CONCEPTOS
            // ==========================================

            // Encabezado de la tabla con fondo azul
            const tableHeaderY = doc.y;
            doc.fillColor(primaryColor).rect(50, tableHeaderY, 500, 25).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(12).text('Fecha', 70, tableHeaderY + 7);
            doc.text('Descripción', 240, tableHeaderY + 7);
            doc.text('Importe', 490, tableHeaderY + 7, { align: 'right' });

            // Posición después del encabezado
            doc.y = tableHeaderY + 25;

            // Configuración de la tabla
            /** @type {number} Posición X inicial de la tabla */
            const tableLeft = 50;

            /** @type {number} Ancho de la columna fecha */
            const dateWidth = 150;

            /** @type {number} Ancho de la columna descripción */
            const descWidth = 270;

            /** @type {number} Ancho de la columna importe */
            const priceWidth = 80;

            /** @type {number} Alto de cada fila */
            const rowHeight = 30;

            // Dibujar fila de datos
            const rowY = doc.y;

            // Bordes de las celdas
            doc.strokeColor('#cccccc').lineWidth(0.5);
            doc.rect(tableLeft, rowY, dateWidth, rowHeight).stroke();
            doc.rect(tableLeft + dateWidth, rowY, descWidth, rowHeight).stroke();
            doc.rect(tableLeft + dateWidth + descWidth, rowY, priceWidth, rowHeight).stroke();

            // Contenido de las celdas
            doc.fillColor('black').font('Helvetica').fontSize(10);

            // Fecha de la factura
            doc.text(
                bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A',
                tableLeft + 10,
                rowY + 10,
                { width: dateWidth - 20 }
            );

            // Descripción (dirección del inmueble)
            doc.text(
                bill.estate_address || 'N/A',
                tableLeft + dateWidth + 10,
                rowY + 10,
                { width: descWidth - 20 }
            );

            // Importe (base imponible)
            doc.text(
                `${formatNumber(taxBase)} €`,
                tableLeft + dateWidth + descWidth + 10,
                rowY + 10,
                { width: priceWidth - 20, align: 'right' }
            );

            // Actualizar posición Y
            doc.y = rowY + rowHeight;

            // ==========================================
            // RESUMEN ECONÓMICO
            // ==========================================

            doc.moveDown(3);

            /** @type {number} Posición X del resumen */
            const summaryX = 50;

            /** @type {number} Posición Y del resumen */
            const summaryY = doc.y;

            // Base imponible
            doc.font('Helvetica-Bold').fontSize(11).fillColor('black').text('Base Imponible', summaryX, summaryY);
            doc.font('Helvetica').text(`${formatNumber(taxBase)} €`, summaryX + 430, summaryY, { width: 70, align: 'right' });

            // IVA
            doc.font('Helvetica-Bold').text(`I.V.A. ${iva}%`, summaryX, summaryY + 20);
            doc.font('Helvetica').text(`${formatNumber(ivaAmount)} €`, summaryX + 430, summaryY + 20, { width: 70, align: 'right' });

            // IRPF (retención)
            doc.font('Helvetica-Bold').text(`I.R.P.F. ${irpf}%`, summaryX, summaryY + 40);
            doc.font('Helvetica').text(`-${formatNumber(irpfAmount)} €`, summaryX + 430, summaryY + 40, { width: 70, align: 'right' });

            // Línea separadora
            doc.strokeColor('#cccccc').lineWidth(1).moveTo(summaryX, summaryY + 60).lineTo(summaryX + 500, summaryY + 60).stroke();

            // Total final
            doc.font('Helvetica-Bold').text('Total de la factura', summaryX, summaryY + 70);
            doc.font('Helvetica-Bold').text(`${formatNumber(total)} €`, summaryX + 430, summaryY + 70, { width: 70, align: 'right' });

            // ==========================================
            // INFORMACIÓN DE PAGO
            // ==========================================

            doc.moveDown(4);

            /** @type {number} Posición Y de la sección de pago */
            const paymentY = doc.y;

            // Encabezado de formas de pago
            doc.fillColor(primaryColor).rect(50, paymentY, 500, 25).fill();

            // Título centrado
            const formaPagoText = 'FORMA DE PAGO';
            const textWidth = doc.widthOfString(formaPagoText);
            const centerX = 50 + (500 - textWidth) / 2;

            doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
                .text(formaPagoText, centerX, paymentY + 7);

            doc.y = paymentY + 30;

            // Detalles de pago
            doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text('Método de pago:', 50, doc.y);
            doc.font('Helvetica').text('Transferencia bancaria', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Entidad bancaria:', 50, doc.y);
            doc.font('Helvetica').text('BBVA', 150, doc.y);
            if (bill.bank_name) doc.font('Helvetica').text(bill.bank_name, 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Titular de la cuenta:', 50, doc.y);
            doc.font('Helvetica').text(bill.account_holder || `${bill.owner_name} ${bill.owner_lastname}` || 'N/A', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Número de cuenta (IBAN):', 50, doc.y);
            doc.font('Helvetica').text(bill.iban || 'ES12 3456 7890 1234 5678 9012', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Concepto:', 50, doc.y);
            doc.font('Helvetica').text(`Factura ${bill.bill_number || 'N/A'}`, 150, doc.y);

            // Nota final
            doc.moveDown(2);
            doc.font('Helvetica-Oblique').fontSize(9)
                .text('Por favor, incluya el número de factura en el concepto de la transferencia.', 50, doc.y, { align: 'center' });

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