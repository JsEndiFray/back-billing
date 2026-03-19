/**
 * Generador de PDF para el Libro de IVA
 * Encapsula toda la lógica de renderizado de documentos PDF del libro de IVA
 */

/**
 * Dibuja una tabla en un documento PDFKit
 * @param {PDFDocument} doc - Instancia del documento PDFKit
 * @param {Array} data - Filas de datos
 * @param {Array} columns - Definición de columnas
 * @param {number} startY - Posición Y inicial
 * @returns {number} Posición Y final
 */
function drawTable(doc, data, columns, startY) {
    const tableTop = startY || doc.y;
    const tableLeft = 50;
    const columnWidth = (doc.page.width - 100) / columns.length;
    let currentY = tableTop;

    doc.fontSize(8).font('Helvetica-Bold');
    columns.forEach((col, i) => {
        doc.text(col.header,
            tableLeft + (i * columnWidth),
            currentY,
            { width: columnWidth, align: col.align || 'left' }
        );
    });

    currentY += 20;
    doc.moveTo(tableLeft, currentY).lineTo(doc.page.width - 50, currentY).stroke();
    currentY += 5;

    doc.font('Helvetica').fontSize(7);
    data.forEach((row) => {
        if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;

            doc.fontSize(8).font('Helvetica-Bold');
            columns.forEach((col, i) => {
                doc.text(col.header,
                    tableLeft + (i * columnWidth),
                    currentY,
                    { width: columnWidth, align: col.align || 'left' }
                );
            });
            currentY += 20;
            doc.moveTo(tableLeft, currentY).lineTo(doc.page.width - 50, currentY).stroke();
            currentY += 5;
            doc.font('Helvetica').fontSize(7);
        }

        columns.forEach((col, i) => {
            const value = col.format ? col.format(row[col.field]) : (row[col.field] || '-');
            doc.text(value,
                tableLeft + (i * columnWidth),
                currentY,
                { width: columnWidth, align: col.align || 'left' }
            );
        });
        currentY += 15;
    });

    return currentY;
}

/**
 * Formatea un importe monetario en formato español
 * @param {number} amount
 * @returns {string}
 */
function formatAmount(amount) {
    if (amount === null || amount === undefined) return '0,00 €';
    return `${Number(amount).toFixed(2).replace('.', ',')} €`;
}

/**
 * Genera el contenido PDF del libro de IVA y lo escribe en el stream de respuesta
 * @param {PDFDocument} doc - Instancia del documento PDFKit
 * @param {string} bookType - 'supported' | 'charged' | 'both'
 * @param {Object} bookData - Datos del libro generados por VATBookService
 * @param {Object|null} companyData - Datos de la empresa
 * @param {string} title - Título del documento
 * @param {string} period - Descripción del período
 */
export function generateVATBookPDFContent(doc, bookType, bookData, companyData, title, period) {
    const dateColumns = (v) => v ? new Date(v).toLocaleDateString('es-ES') : '-';

    doc.fontSize(20).text(title, { align: 'center' });
    doc.fontSize(12).text(period, { align: 'center' });
    doc.moveDown();

    if (companyData) {
        doc.fontSize(10)
            .text(`Empresa: ${companyData.nombre || 'N/A'}`)
            .text(`NIF: ${companyData.nif || 'N/A'}`)
            .text(`Dirección: ${companyData.direccion || 'N/A'}`)
            .moveDown();
    }

    if (bookType === 'both') {
        doc.addPage();
        doc.fontSize(14).text('IVA Soportado', { align: 'center' });
        doc.moveDown();

        const supportedColumns = [
            { field: 'numeroFactura', header: 'Nº Factura' },
            { field: 'fechaFactura', header: 'Fecha', format: dateColumns },
            { field: 'nombreProveedor', header: 'Proveedor' },
            { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
            { field: 'cuotaIVA', header: 'IVA', align: 'right', format: formatAmount }
        ];
        drawTable(doc, bookData.supported.entries, supportedColumns, doc.y);

        doc.addPage();
        doc.fontSize(14).text('IVA Repercutido', { align: 'center' });
        doc.moveDown();

        const chargedColumns = [
            { field: 'numeroFactura', header: 'Nº Factura' },
            { field: 'fechaFactura', header: 'Fecha', format: dateColumns },
            { field: 'nombreCliente', header: 'Cliente' },
            { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
            { field: 'cuotaIVA', header: 'IVA', align: 'right', format: formatAmount }
        ];
        drawTable(doc, bookData.charged.entries, chargedColumns, doc.y);

    } else {
        const columns = bookType === 'supported' ? [
            { field: 'numeroFactura', header: 'Nº Factura' },
            { field: 'fechaFactura', header: 'Fecha', format: dateColumns },
            { field: 'nombreProveedor', header: 'Proveedor' },
            { field: 'nifProveedor', header: 'NIF' },
            { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
            { field: 'tipoIVA', header: '%IVA', align: 'right', format: (v) => `${v}%` },
            { field: 'cuotaIVA', header: 'Cuota IVA', align: 'right', format: formatAmount }
        ] : [
            { field: 'numeroFactura', header: 'Nº Factura' },
            { field: 'fechaFactura', header: 'Fecha', format: dateColumns },
            { field: 'nombreCliente', header: 'Cliente' },
            { field: 'nifCliente', header: 'NIF' },
            { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
            { field: 'tipoIVA', header: '%IVA', align: 'right', format: (v) => `${v}%` },
            { field: 'cuotaIVA', header: 'Cuota IVA', align: 'right', format: formatAmount }
        ];

        drawTable(doc, bookData.entries, columns, doc.y);

        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(`Total Base Imponible: ${formatAmount(bookData.totals?.totalBaseImponible || 0)}`, { align: 'right' });
        doc.text(`Total Cuota IVA: ${formatAmount(bookData.totals?.totalCuotaIVA || 0)}`, { align: 'right' });
    }
}
