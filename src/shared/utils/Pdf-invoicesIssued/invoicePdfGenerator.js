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
 * @function generateInvoicePdf
 * @param {Object} invoice - Objeto con todos los datos de la factura
 * @param {string} invoice.invoice_number - Número de la factura
 * @param {string} invoice.owner_name - Nombre del propietario
 * @param {string} invoice.owner_lastname - Apellidos del propietario
 * @param {string} invoice.owner_identification - NIF/CIF del propietario
 * @param {string} invoice.owner_phone - Teléfono del propietario
 * @param {string} invoice.owner_address - Dirección del propietario
 * @param {string} invoice.client_name - Nombre del cliente
 * @param {string} invoice.client_lastname - Apellidos del cliente
 * @param {string} invoice.client_identification - NIF/CIF del cliente
 * @param {string} invoice.client_phone - Teléfono del cliente
 * @param {string} invoice.client_company_name - Nombre de empresa del cliente
 * @param {number} invoice.tax_base - Base imponible
 * @param {number} invoice.iva - Porcentaje de IVA
 * @param {number} invoice.irpf - Porcentaje de IRPF
 * @param {number} invoice.total - Total calculado
 * @param {string} outputPath - Ruta donde guardar el archivo PDF
 * @returns {Promise<string>} Promesa que resuelve con la ruta del archivo generado
 *
 * @example
 * const invoices = {
 * invoice_number: "FACT-0001",
 * owner_name: "Juan",
 * owner_lastname: "Pérez",
 * owner_identification: "12345678Z",
 * owner_phone: "666777000",
 * client_name: "María",
 * client_lastname: "García",
 * client_identification: "87654321Y",
 * client_phone: "666777234",
 * tax_base: 1000,
 * iva: 21,
 * irpf: 15,
 * total: 1060
 * };
 *
 * try {
 * const pdfPath = await generateInvoicePdf(invoices, './factura.pdf');
 * console.log('PDF generado:', pdfPath);
 * } catch (error) {
 * console.error('Error generando PDF:', error);
 * }
 *
 * @throws {Error} Si hay problemas escribiendo el archivo o datos inválidos
 */
export const generateInvoicePdf = (invoice, outputPath) => { // CAMBIO: Nombre de función y parámetro
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
            const doc = new PDFDocument({margin: 50, size: 'A4'});

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
            doc.text(`${invoice.owner_name || ''} ${invoice.owner_lastname || ''}`, leftColumnX, doc.y);
            doc.text(`NIF: ${invoice.owner_identification || 'N/A'}`, leftColumnX, doc.y + 5);
            doc.text(`Teléfono: ${invoice.owner_phone || 'N/A'}`, leftColumnX, doc.y + 5);
            doc.text(`${invoice.owner_address || 'N/A'}`, leftColumnX, doc.y + 5);

            // Formato de ubicación (código postal + localidad)
            let locationText = '';
            if (invoice.owner_postal_code) locationText += invoice.owner_postal_code + '- ';
            if (invoice.owner_location) locationText += invoice.owner_location;
            if (locationText.trim()) doc.text(locationText, leftColumnX, doc.y + 5);

            // ==========================================
            // SECCIÓN DEL ARRENDATARIO (COLUMNA DERECHA)
            // ==========================================

            // Número de factura
            doc.font('Helvetica-Bold').fontSize(10).text('Nº de factura', rightColumnX, startY, {width: 100});
            doc.font('Helvetica').text(invoice.invoice_number || 'N/A', rightColumnX + 100, startY);

            // Nombre del arrendatario (empresa o persona física)
            doc.font('Helvetica-Bold').text('Arrendatario', rightColumnX, doc.y + 5, {width: 100});
            const clientName = invoice.client_company_name || `${invoice.client_name || ''} ${invoice.client_lastname || ''}`;
            doc.font('Helvetica').text(clientName, rightColumnX + 100, doc.y - doc.currentLineHeight());

            // NIF del cliente
            doc.font('Helvetica-Bold').text('NIF', rightColumnX, doc.y + 5, {width: 100});
            doc.font('Helvetica').text(invoice.client_identification || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Teléfono del cliente
            doc.font('Helvetica-Bold').text('Teléfono', rightColumnX, doc.y + 5, {width: 100});
            doc.font('Helvetica').text(invoice.client_phone || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Dirección del cliente
            doc.font('Helvetica-Bold').text('Dirección', rightColumnX, doc.y + 5, {width: 100});
            doc.font('Helvetica').text(invoice.client_address || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Código postal del cliente
            doc.font('Helvetica-Bold').text('Código Postal', rightColumnX, doc.y + 5, {width: 100});
            doc.font('Helvetica').text(invoice.client_postal_code || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Localidad del cliente
            doc.font('Helvetica-Bold').text('Localidad', rightColumnX, doc.y + 5, {width: 100});
            doc.font('Helvetica').text(invoice.client_location || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // Provincia del cliente
            doc.font('Helvetica-Bold').text('Provincia', rightColumnX, doc.y + 5, {width: 100});
            doc.font('Helvetica').text(invoice.client_province || 'N/A', rightColumnX + 100, doc.y - doc.currentLineHeight());

            // ==========================================
            // CÁLCULOS FISCALES
            // ==========================================

            /** @type {number} Base imponible de la factura */
            const taxBase = safeNumber(invoice.tax_base);

            /** @type {number} Porcentaje de IVA */
            const iva = safeNumber(invoice.iva);

            /** @type {number} Porcentaje de IRPF */
            const irpf = safeNumber(invoice.irpf);

            /** @type {number} Importe del IVA calculado */
            const ivaAmount = taxBase * iva / 100;

            /** @type {number} Importe del IRPF calculado */
            const irpfAmount = taxBase * irpf / 100;

            /** @type {number} Total final de la factura */
            const total = safeNumber(invoice.total);

            doc.moveDown(2);

            // ==========================================
            // DETECCIÓN DE TIPO DE FACTURACIÓN
            // ==========================================

            /** @type {boolean} Si es factura proporcional */
            const isProportional = invoice.is_proportional === 1;

            /** @type {string} Descripción del período facturado */
            let periodDescription = 'Mes completo';
            let periodDetails = '';

            if (isProportional && invoice.start_date && invoice.end_date) {
                const startDate = new Date(invoice.start_date);
                const endDate = new Date(invoice.end_date);

                // Formatear fechas
                const startFormatted = startDate.toLocaleDateString('es-ES');
                const endFormatted = endDate.toLocaleDateString('es-ES');

                // Calcular días
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                // Calcular días del mes
                const year = startDate.getFullYear();
                const month = startDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                // Calcular porcentaje
                const percentage = ((diffDays / daysInMonth) * 100).toFixed(2);

                periodDescription = `Del ${startFormatted} al ${endFormatted}`;
                periodDetails = `${diffDays} días de ${daysInMonth} días del mes (${percentage}%)`;
            }

            // ==========================================
            // TABLA DE CONCEPTOS
            // ==========================================

            // Encabezado de la tabla con fondo azul
            const tableHeaderY = doc.y;
            doc.fillColor(primaryColor).rect(50, tableHeaderY, 500, 25).fill();
            doc.fillColor('white').font('Helvetica-Bold').fontSize(12).text('Período', 70, tableHeaderY + 7);
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
            const rowHeight = 40;

            // Dibujar fila de datos
            const rowY = doc.y;

            // Bordes de las celdas
            doc.strokeColor('#cccccc').lineWidth(0.5);
            doc.rect(tableLeft, rowY, dateWidth, rowHeight).stroke();
            doc.rect(tableLeft + dateWidth, rowY, descWidth, rowHeight).stroke();
            doc.rect(tableLeft + dateWidth + descWidth, rowY, priceWidth, rowHeight).stroke();

            // Contenido de las celdas
            doc.fillColor('black').font('Helvetica').fontSize(10);

            // Período facturado
            doc.text(
                periodDescription,
                tableLeft + 10,
                rowY + 5,
                { width: dateWidth - 20 }
            );

            // Detalles adicionales para proporcionales
            if (isProportional && periodDetails) {
                doc.font('Helvetica').fontSize(8).fillColor('#666666');
                doc.text(
                    periodDetails,
                    tableLeft + 10,
                    rowY + 18,
                    { width: dateWidth - 20 }
                );
                doc.font('Helvetica').fontSize(10).fillColor('black');
            }

            // Descripción (dirección del inmueble + mes correspondencia)
            let description = invoice.estate_address || 'N/A';
            if (invoice.corresponding_month) {
                const [year, month] = invoice.corresponding_month.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const monthName = monthNames[parseInt(month, 10) - 1];
                description += `(Corresponde a ${monthName} ${year})`;
            }
            // conceptos de la descripcion
            doc.text(
                description,
                tableLeft + dateWidth + 10,
                rowY + 10,
                { width: descWidth - 20 }
            );

            // Importe (base imponible)
            doc.text(
                `${formatNumber(taxBase)} €`,
                tableLeft + dateWidth + descWidth + 10,
                rowY + 10,
                {width: priceWidth - 20, align: 'right'}
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
            doc.font('Helvetica').text(`${formatNumber(taxBase)} €`, summaryX + 430, summaryY, {
                width: 70,
                align: 'right'
            });

            // IVA
            doc.font('Helvetica-Bold').text(`I.V.A. ${iva}%`, summaryX, summaryY + 20);
            doc.font('Helvetica').text(`${formatNumber(ivaAmount)} €`, summaryX + 430, summaryY + 20, {
                width: 70,
                align: 'right'
            });

            // IRPF (retención)
            doc.font('Helvetica-Bold').text(`I.R.P.F. ${irpf}%`, summaryX, summaryY + 40);
            doc.font('Helvetica').text(`-${formatNumber(irpfAmount)} €`, summaryX + 430, summaryY + 40, {
                width: 70,
                align: 'right'
            });

            // Línea separadora
            doc.strokeColor('#cccccc').lineWidth(1).moveTo(summaryX, summaryY + 60).lineTo(summaryX + 500, summaryY + 60).stroke();

            // Total final
            doc.font('Helvetica-Bold').text('Total de la factura', summaryX, summaryY + 70);
            doc.font('Helvetica-Bold').text(`${formatNumber(total)} €`, summaryX + 430, summaryY + 70, {
                width: 70,
                align: 'right'
            });

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
            if (invoice.bank_name) doc.font('Helvetica').text(invoice.bank_name, 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Titular de la cuenta:', 50, doc.y);
            doc.font('Helvetica').text(invoice.account_holder || `${invoice.owner_name} ${invoice.owner_lastname}` || 'N/A', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Número de cuenta (IBAN):', 50, doc.y);
            doc.font('Helvetica').text(invoice.iban || 'ES12 3456 7890 1234 5678 9012', 150, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica-Bold').text('Concepto:', 50, doc.y);
            doc.font('Helvetica').text(`Factura ${invoice.invoice_number || 'N/A'}`, 150, doc.y);

            // Nota final
            doc.moveDown(2);
            doc.font('Helvetica-Oblique').fontSize(9)
                .text('Por favor, incluya el número de factura en el concepto de la transferencia.', 50, doc.y, {align: 'center'});

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