/**
 * @fileoverview Controlador para el Libro de IVA
 *
 * Maneja todas las operaciones relacionadas con la generación
 * y exportación de los libros de registro de IVA según normativa AEAT
 *
 * @requires ../services/VATBookService.js
 * @author Tu Nombre
 * @since 1.0.0
 */

import VATBookService from "../services/VATBookServices.js";
import path from 'path';
import fs from 'fs';
import ExcelGenerator from "../shared/utils/excelGenerador/ExcelGenerator.js";
import CompanyService from "../services/CompanyService.js";
import CalculateHelper from "../shared/helpers/calculateTotal.js";

/**
 * Controlador para la gestión del Libro de IVA
 */
export default class VATBookController {

    // ==========================================
    // LIBRO DE IVA SOPORTADO
    // ==========================================

    /**
     * Genera el libro de IVA soportado (facturas recibidas)
     *
     * @async
     * @function getVATSupportedBook
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/supported/2024?quarter=1
     * // GET /api/vat-book/supported/2024?month=3
     */
    static async getVATSupportedBook(req, res) {
        try {
            const {year, quarter, month} = req.params;

            // Validar año
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            // Convertir parámetros
            const yearNum = Number(year);
            const quarterNum = quarter ? Number(quarter) : null;
            const monthNum = month ? Number(month) : null;

            // Generar libro
            const bookData = await VATBookService.generateVATSupportedBook(
                yearNum,
                quarterNum,
                monthNum
            );

            return res.status(200).json({
                success: true,
                message: "Libro de IVA soportado generado correctamente",
                data: bookData
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor",
                error: error.message
            });
        }
    }

    // ==========================================
    // LIBRO DE IVA REPERCUTIDO
    // ==========================================

    /**
     * Genera el libro de IVA repercutido (facturas emitidas)
     *
     * @async
     * @function getVATChargedBook
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/charged/2024?quarter=1
     * // GET /api/vat-book/charged/2024?month=3
     */
    static async getVATChargedBook(req, res) {
        try {
            const {year, quarter, month} = req.params;

            // Validar año
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            // Convertir parámetros
            const yearNum = Number(year);
            const quarterNum = quarter ? Number(quarter) : null;
            const monthNum = month ? Number(month) : null;

            // Generar libro
            const bookData = await VATBookService.generateVATChargedBook(
                yearNum,
                quarterNum,
                monthNum
            );

            return res.status(200).json({
                success: true,
                message: "Libro de IVA repercutido generado correctamente",
                data: bookData
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor",
                error: error.message
            });
        }
    }

    // ==========================================
    // LIQUIDACIÓN TRIMESTRAL
    // ==========================================

    /**
     * Genera la liquidación trimestral completa de IVA (Modelo 303)
     *
     * @async
     * @function getQuarterlyVATLiquidation
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/liquidation/2024/1
     */
    static async getQuarterlyVATLiquidation(req, res) {
        try {
            const {year, quarter} = req.params;

            // Validar parámetros
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            if (!quarter || isNaN(Number(quarter)) || Number(quarter) < 1 || Number(quarter) > 4) {
                return res.status(400).json({  // ← OBJETO
                    success: false,
                    message: "Trimestre debe ser entre 1 y 4",
                    errors: ["El trimestre debe estar entre 1 y 4"]
                });
            }

            // Generar liquidación
            const liquidationData = await VATBookService.generateQuarterlyVATLiquidation(
                Number(year),
                Number(quarter)
            );

            return res.status(200).json({
                success: true,
                message: `Liquidación T${quarter} ${year} generada correctamente`,
                data: liquidationData
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor",
                error: error.message
            });
        }
    }

    // ==========================================
    // LIBRO COMPLETO (AMBOS)
    // ==========================================

    /**
     * Genera ambos libros de IVA (soportado y repercutido)
     *
     * @async
     * @function getCompleteVATBooks
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/complete/2024?quarter=1
     */
    static async getCompleteVATBooks(req, res) {
        try {
            const {year, quarter, month} = req.params;
            // Validar año
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            // Convertir parámetros
            const yearNum = Number(year);
            const quarterNum = quarter ? Number(quarter) : null;
            const monthNum = month ? Number(month) : null;

            // Generar ambos libros en paralelo
            const [supportedBook, chargedBook] = await Promise.all([
                VATBookService.generateVATSupportedBook(yearNum, quarterNum, monthNum),
                VATBookService.generateVATChargedBook(yearNum, quarterNum, monthNum)
            ]);

            // Calcular resumen combinado
            const combinedSummary = {
                period: supportedBook.period,
                totalEntries: supportedBook.entryCount + chargedBook.entryCount,
                vatSummary: {
                    totalVATSupported: supportedBook.totals.cuotaIVADeducible,
                    totalVATCharged: chargedBook.totals.totalCuotaIVA,
                    netVATPosition: chargedBook.totals.totalCuotaIVA - supportedBook.totals.cuotaIVADeducible
                }
            };

            return res.status(200).json({
                success: true,
                message: "Libros de IVA completos generados correctamente",
                data: {
                    summary: combinedSummary,
                    supportedBook,
                    chargedBook
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor",
                error: error.message
            });
        }
    }

    // ==========================================
    // EXPORTACIÓN A EXCEL AEAT
    // ==========================================

    /**
     * Exporta el libro de IVA al formato Excel oficial AEAT
     *
     * @async
     * @function exportVATBookToExcel
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/vat-book/export/excel
     * // Body: { bookType: "supported", year: 2024, quarter: 1, companyData: {...} }
     **/

    /*
       /**
     * Exporta libro de IVA a Excel (prepara datos)
     */
    static async exportVATBookToExcel(req, res) {
        try {
            const {bookType, year, quarter, month, companyData} = req.body;

            if (!bookType || !['supported', 'charged'].includes(bookType)) {
                return res.status(400).json({
                    success: false,
                    message: "bookType debe ser 'supported' o 'charged'"
                });
            }

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido"
                });
            }

            const validation = CompanyService.validateCompanyData(companyData);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }

            let bookData;
            if (bookType === 'supported') {
                bookData = await VATBookService.generateVATSupportedBook(
                    Number(year),
                    quarter ? Number(quarter) : null,
                    month ? Number(month) : null
                );
            } else {
                bookData = await VATBookService.generateVATChargedBook(
                    Number(year),
                    quarter ? Number(quarter) : null,
                    month ? Number(month) : null
                );
            }

            const excelResult = await ExcelGenerator.generateVATBookExcel(bookData, companyData);

            return res.status(200).json({
                success: true,
                message: "Datos preparados para exportación",
                data: {
                    fileName: excelResult.fileName,
                    filePath: excelResult.filePath
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error al generar archivo Excel"
            });
        }
    }

    // ==========================================
    // ESTADÍSTICAS Y RESÚMENES
    // ==========================================

    /**
     * Obtiene estadísticas anuales de IVA
     *
     * @async
     * @function getAnnualVATStats
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/stats/2024
     */
    static async getAnnualVATStats(req, res) {
        try {
            const {year} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            const yearNum = Number(year);

            // Generar libros anuales
            const [supportedBook, chargedBook] = await Promise.all([
                VATBookService.generateVATSupportedBook(yearNum),
                VATBookService.generateVATChargedBook(yearNum)
            ]);

            // Generar estadísticas trimestrales
            const quarterlyStats = [];
            for (let quarter = 1; quarter <= 4; quarter++) {
                try {
                    const liquidation = await VATBookService.generateQuarterlyVATLiquidation(yearNum, quarter);
                    quarterlyStats.push({
                        quarter,
                        period: `T${quarter} ${yearNum}`,
                        vatToPayOrRefund: liquidation.liquidation.importeResultado,
                        status: liquidation.liquidation.resultadoLiquidacion
                    });
                } catch (err) {
                    quarterlyStats.push({
                        quarter,
                        period: `T${quarter} ${yearNum}`,
                        error: 'Sin datos'
                    });
                }
            }

            const stats = {
                year: yearNum,
                summary: {
                    totalVATSupported: supportedBook.totals.cuotaIVADeducible,
                    totalVATCharged: chargedBook.totals.totalCuotaIVA,
                    netVATPosition: chargedBook.totals.totalCuotaIVA - supportedBook.totals.cuotaIVADeducible,
                    totalInvoicesReceived: supportedBook.entryCount,
                    totalInvoicesIssued: chargedBook.entryCount
                },
                quarterlyBreakdown: quarterlyStats,
                supportedVATBreakdown: supportedBook.totals.desgloseIVA,
                chargedVATBreakdown: chargedBook.totals.desgloseIVA
            };

            return res.status(200).json({
                success: true,
                message: `Estadísticas de IVA ${yearNum} generadas correctamente`,
                data: stats
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor",
                error: error.message
            });
        }
    }

    /**
     * Obtiene resumen trimestral comparativo
     *
     * @async
     * @function getQuarterlyComparison
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/comparison/2024
     */
    static async getQuarterlyComparison(req, res) {
        try {
            const {year} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            const yearNum = Number(year);
            const comparison = [];

            // Generar comparación trimestral
            for (let quarter = 1; quarter <= 4; quarter++) {
                try {
                    const [supportedBook, chargedBook] = await Promise.all([
                        VATBookService.generateVATSupportedBook(yearNum, quarter),
                        VATBookService.generateVATChargedBook(yearNum, quarter)
                    ]);

                    comparison.push({
                        quarter,
                        period: `T${quarter} ${yearNum}`,
                        invoicesReceived: supportedBook.entryCount,
                        invoicesIssued: chargedBook.entryCount,
                        vatSupported: supportedBook.totals.cuotaIVADeducible,
                        vatCharged: chargedBook.totals.totalCuotaIVA,
                        netPosition: chargedBook.totals.totalCuotaIVA - supportedBook.totals.cuotaIVADeducible
                    });
                } catch (err) {
                    comparison.push({
                        quarter,
                        period: `T${quarter} ${yearNum}`,
                        error: 'Sin datos suficientes'
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Comparación trimestral generada correctamente",
                data: {
                    year: yearNum,
                    quarterlyComparison: comparison
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor",
                error: error.message
            });
        }
    }

    // ==========================================
    // UTILIDADES Y CONFIGURACIÓN
    // ==========================================

    /**
     * Obtiene la configuración disponible para el libro de IVA
     *
     * @async
     * @function getVATBookConfig
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     */
    static async getVATBookConfig(req, res) {
        try {
            const config = {
                availableYears: [2020, 2021, 2022, 2023, 2024, 2025],
                quarters: [
                    {value: 1, label: 'T1 (Ene-Mar)', months: [1, 2, 3]},
                    {value: 2, label: 'T2 (Abr-Jun)', months: [4, 5, 6]},
                    {value: 3, label: 'T3 (Jul-Sep)', months: [7, 8, 9]},
                    {value: 4, label: 'T4 (Oct-Dic)', months: [10, 11, 12]}
                ],
                bookTypes: [
                    {value: 'supported', label: 'IVA Soportado (Facturas Recibidas)', code: 'R'},
                    {value: 'charged', label: 'IVA Repercutido (Facturas Emitidas)', code: 'E'}
                ],
                exportFormats: [
                    {value: 'json', label: 'JSON'},
                    {value: 'excel', label: 'Excel AEAT'},
                    {value: 'csv', label: 'CSV'}
                ],
                vatRates: [0, 4, 10, 21],
                operationKeys: {
                    '01': 'Operación general',
                    '02': 'Abono/Rectificativa',
                    '03': 'Operación exenta'
                }
            };

            return res.status(200).json({
                success: true,
                message: "Configuración del libro de IVA",
                data: config
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /**
     * Valida datos de empresa para exportación AEAT
     *
     * @async
     * @function validateCompanyData
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     */
    static async validateCompanyData(req, res) {
        try {
            const {companyData} = req.body;

            if (!companyData) {
                return res.status(400).json({
                    success: false,
                    message: "Datos de empresa requeridos"
                });
            }

            const requiredFields = ['nif', 'name'];
            const missingFields = requiredFields.filter(field => !companyData[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
                });
            }

            // Validar formato NIF
            const nifRegex = /^[A-Z]\d{8}$|^\d{8}[A-Z]$/;
            if (!nifRegex.test(companyData.nif)) {
                return res.status(400).json({
                    success: false,
                    message: "Formato de NIF inválido"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Datos de empresa válidos",
                data: {
                    isValid: true,
                    validatedFields: requiredFields
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    /*METODOS PARA EXCEL*/

    /**
     * Descarga el libro de IVA en formato Excel
     * Funciona tanto con GET (query params) como con POST (body)
     * @param {express.Request} req
     * @param {express.Response} res
     */
    /**
     * Descarga el libro de IVA en formato Excel
     * Funciona tanto con GET (query params) como con POST (body)
     * @param {express.Request} req
     * @param {express.Response} res
     */
    static async downloadVATBookExcel(req, res) {
        try {
            // Obtener parámetros según el método HTTP
            let bookType, year, quarter, month, companyData;

            if (req.method === 'GET') {
                // Para peticiones GET desde navegador
                bookType = req.query.bookType;
                year = req.query.year;
                quarter = req.query.quarter;
                month = req.query.month;

                // Usar datos de empresa por defecto
                companyData = CompanyService.getCompanyData();
            } else {
                // Para peticiones POST desde frontend
                ({bookType, year, quarter, month, companyData} = req.body);

                // Si no hay companyData, usar por defecto
                if (!companyData) {
                    companyData = CompanyService.getCompanyData();
                }
            }

            // Validaciones básicas
            if (!bookType || !['supported', 'charged'].includes(bookType)) {
                return res.status(400).json({
                    success: false,
                    message: "bookType debe ser 'supported' o 'charged'. Ejemplo: ?bookType=supported"
                });
            }

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido. Ejemplo: ?year=2024"
                });
            }

            // Validar datos de empresa
            const validation = CompanyService.validateCompanyData(companyData);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }

            // Generar el libro correspondiente
            let bookData;
            if (bookType === 'supported') {
                bookData = await VATBookService.generateVATSupportedBook(
                    Number(year),
                    quarter ? Number(quarter) : null,
                    month ? Number(month) : null
                );
            } else {
                bookData = await VATBookService.generateVATChargedBook(
                    Number(year),
                    quarter ? Number(quarter) : null,
                    month ? Number(month) : null
                );
            }

            // Generar Excel
            const excelResult = await ExcelGenerator.generateVATBookExcel(bookData, companyData);
            // Enviar archivo para descarga
            res.download(excelResult.filePath, excelResult.fileName, (err) => {
                if (err) {
                    if (!res.headersSent) {
                        return res.status(500).json({
                            success: false,
                            message: "Error enviando archivo para descarga"
                        });
                    }
                } else {
                    console.log('Archivo enviado correctamente:', excelResult.fileName);
                }

                // Limpiar archivo temporal después de la descarga
                setTimeout(() => {
                    try {
                        if (fs.existsSync(excelResult.filePath)) {
                            fs.unlinkSync(excelResult.filePath);
                            console.log('Archivo temporal eliminado:', excelResult.filePath);
                        }
                    } catch (cleanupError) {
                        console.error('Error limpiando archivo temporal:', cleanupError);
                    }
                }, 5000);
            });

        } catch (error) {
            console.error('Error en downloadVATBookExcel:', error);

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Error interno del servidor",
                    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        }
    }


// ==========================================
// DESCARGAR PDF DEL LIBRO DE IVA
// ==========================================

    /**
     * Descarga el libro de IVA en formato PDF
     *
     * @async
     * @function downloadVATBookPDF
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * POST /api/vat-book/download/pdf
     * Body: { year: 2024, quarter: 1, bookType: "supported" }
     */
    static async downloadVATBookPDF(req, res) {
        try {
            const { year, quarter, month, bookType } = req.body;

            // Validar parámetros
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido"
                });
            }

            const yearNum = Number(year);
            const quarterNum = quarter ? Number(quarter) : null;
            const monthNum = month ? Number(month) : null;

            // Importar PDFKit dinámicamente
            const PDFDocument = (await import('pdfkit')).default;

            // Obtener datos de la empresa
            const companyData = await CompanyService.getCompanyData();

            // Generar los datos según el tipo de libro
            let bookData;
            let title;

            switch (bookType) {
                case 'supported':
                    bookData = await VATBookService.generateVATSupportedBook(yearNum, quarterNum, monthNum);
                    title = 'Libro de IVA Soportado';
                    break;
                case 'charged':
                    bookData = await VATBookService.generateVATChargedBook(yearNum, quarterNum, monthNum);
                    title = 'Libro de IVA Repercutido';
                    break;
                case 'both':
                    const [supported, charged] = await Promise.all([
                        VATBookService.generateVATSupportedBook(yearNum, quarterNum, monthNum),
                        VATBookService.generateVATChargedBook(yearNum, quarterNum, monthNum)
                    ]);
                    bookData = { supported, charged };
                    title = 'Libro de IVA Completo';
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Tipo de libro no válido. Use: 'supported', 'charged' o 'both'"
                    });
            }

            // Crear documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // Configurar headers para descarga
            const period = CalculateHelper.generatePeriodDescription(yearNum, quarterNum, monthNum);
            const filename = `Libro-IVA-${bookType}-${period.replace(/\s+/g, '-')}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Pipe del PDF a la respuesta
            doc.pipe(res);

            // ==========================================
            // GENERAR CONTENIDO DEL PDF
            // ==========================================

            // Encabezado
            doc.fontSize(20).text(title, { align: 'center' });
            doc.fontSize(12).text(period, { align: 'center' });
            doc.moveDown();

            // Datos de la empresa
            if (companyData) {
                doc.fontSize(10)
                    .text(`Empresa: ${companyData.nombre || 'N/A'}`)
                    .text(`NIF: ${companyData.nif || 'N/A'}`)
                    .text(`Dirección: ${companyData.direccion || 'N/A'}`)
                    .moveDown();
            }

            // Función auxiliar para dibujar tabla
            const drawTable = (data, columns, startY) => {
                const tableTop = startY || doc.y;
                const tableLeft = 50;
                const columnWidth = (doc.page.width - 100) / columns.length;
                let currentY = tableTop;

                // Headers
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

                // Datos
                doc.font('Helvetica').fontSize(7);
                data.forEach((row) => {
                    // Verificar si necesita nueva página
                    if (currentY > doc.page.height - 100) {
                        doc.addPage();
                        currentY = 50;

                        // Redibujar headers
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
            };

            // Función para formatear montos
            const formatAmount = (amount) => {
                if (amount === null || amount === undefined) return '0,00 €';
                return `${Number(amount).toFixed(2).replace('.', ',')} €`;
            };

            // Generar tablas según el tipo de libro
            if (bookType === 'both') {
                // IVA Soportado
                doc.addPage();
                doc.fontSize(14).text('IVA Soportado', { align: 'center' });
                doc.moveDown();

                const supportedColumns = [
                    { field: 'numeroFactura', header: 'Nº Factura' },
                    { field: 'fechaFactura', header: 'Fecha', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '-' },
                    { field: 'nombreProveedor', header: 'Proveedor' },
                    { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
                    { field: 'cuotaIVA', header: 'IVA', align: 'right', format: formatAmount }
                ];

                drawTable(bookData.supported.entries, supportedColumns, doc.y);

                // IVA Repercutido
                doc.addPage();
                doc.fontSize(14).text('IVA Repercutido', { align: 'center' });
                doc.moveDown();

                const chargedColumns = [
                    { field: 'numeroFactura', header: 'Nº Factura' },
                    { field: 'fechaFactura', header: 'Fecha', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '-' },
                    { field: 'nombreCliente', header: 'Cliente' },
                    { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
                    { field: 'cuotaIVA', header: 'IVA', align: 'right', format: formatAmount }
                ];

                drawTable(bookData.charged.entries, chargedColumns, doc.y);

            } else {
                // Tabla única
                const columns = bookType === 'supported' ? [
                    { field: 'numeroFactura', header: 'Nº Factura' },
                    { field: 'fechaFactura', header: 'Fecha', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '-' },
                    { field: 'nombreProveedor', header: 'Proveedor' },
                    { field: 'nifProveedor', header: 'NIF' },
                    { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
                    { field: 'tipoIVA', header: '%IVA', align: 'right', format: (v) => `${v}%` },
                    { field: 'cuotaIVA', header: 'Cuota IVA', align: 'right', format: formatAmount }
                ] : [
                    { field: 'numeroFactura', header: 'Nº Factura' },
                    { field: 'fechaFactura', header: 'Fecha', format: (v) => v ? new Date(v).toLocaleDateString('es-ES') : '-' },
                    { field: 'nombreCliente', header: 'Cliente' },
                    { field: 'nifCliente', header: 'NIF' },
                    { field: 'baseImponible', header: 'Base', align: 'right', format: formatAmount },
                    { field: 'tipoIVA', header: '%IVA', align: 'right', format: (v) => `${v}%` },
                    { field: 'cuotaIVA', header: 'Cuota IVA', align: 'right', format: formatAmount }
                ];

                drawTable(bookData.entries, columns, doc.y);

                // Totales
                doc.moveDown(2);
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text(`Total Base Imponible: ${formatAmount(bookData.totals?.totalBaseImponible || 0)}`, { align: 'right' });
                doc.text(`Total Cuota IVA: ${formatAmount(bookData.totals?.totalCuotaIVA || 0)}`, { align: 'right' });
            }

            // Finalizar documento
            doc.end();

            console.log('PDF generado correctamente:', filename);

        } catch (error) {
            console.error('Error en downloadVATBookPDF:', error);

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Error interno del servidor al generar el PDF",
                    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        }
    }


    // ==========================================
    // LIBRO DE IVA CONSOLIDADO POR PROPIETARIO
    // ==========================================

    /**
     * Genera el libro de IVA consolidado (emitidas, recibidas, gastos internos)
     * por cada propietario, incluyendo el reparto proporcional.
     *
     * @async
     * @function getVATBookByOwner
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/by-owner/2024?quarter=1
     * // GET /api/vat-book/by-owner/2024?month=7
     * // GET /api/vat-book/by-owner/2024 (para el año completo)
     */
    static async getVATBookByOwner(req, res) {
        try {
            const {year, quarter, month} = req.params;
            // Validar año
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser un número válido."
                });
            }

            // Convertir parámetros a números
            const yearNum = Number(year);
            const quarterNum = quarter ? Number(quarter) : null;
            const monthNum = month ? Number(month) : null;

            // Llamar al servicio para obtener los datos consolidados por propietario
            const bookData = await VATBookService.generateVATBookByOwner(
                yearNum,
                quarterNum,
                monthNum
            );

            return res.status(200).json({
                success: true,
                message: "Libro de IVA por propietario generado correctamente",
                data: bookData
            });

        } catch (error) {
            console.error('Error en getVATBookByOwner:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor al generar el libro de IVA por propietario.",
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined // Mostrar stack en desarrollo
            });
        }
    }

    // ==========================================
    // LIBRO CONSOLIDADO (PARA COMPONENTE)
    // ==========================================

    /**
     * Obtiene datos consolidados del libro de IVA para el componente frontend
     * Combina: IVA soportado, repercutido y resumen por propietario
     *
     * @async
     * @function getConsolidatedVATBook
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/vat-book/consolidated/2025
     * // GET /api/vat-book/consolidated/2025/1 (trimestre)
     * // GET /api/vat-book/consolidated/2025/0/7 (mes específico)
     */
    static async getConsolidatedVATBook(req, res) {
        try {
            const {year, quarter, month} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser un número válido"
                });
            }

            const yearNum = Number(year);
            const quarterNum = quarter && quarter !== '0' ? Number(quarter) : null;
            const monthNum = month && month !== '0' ? Number(month) : null;

            const consolidatedData = await VATBookService.generateConsolidatedVATBook(
                yearNum,
                quarterNum,
                monthNum
            );

            return res.status(200).json({
                success: true,
                message: "Libro de IVA consolidado generado correctamente",
                data: consolidatedData // Ya son arrays limpios
            });

        } catch (error) {
            console.error('Error en getConsolidatedVATBook:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error al generar el libro de IVA consolidado",
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }


    /**
     * Obtiene estadísticas anuales del libro de IVA
     */
    static async getAnnualVATStats(req, res) {
        try {
            const {year} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            const stats = await VATBookService.getAnnualVATStats(Number(year));

            return res.status(200).json({
                success: true,
                message: "Estadísticas anuales generadas correctamente",
                data: stats
            });

        } catch (error) {
            console.error('Error en getAnnualVATStats:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor"
            });
        }
    }

    /**
     * Compara trimestres del año
     */
    static async getQuarterlyVATComparison(req, res) {
        try {
            const {year} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({
                    success: false,
                    message: "Año requerido y debe ser válido",
                    errors: ["El año debe ser un número válido"]
                });
            }

            const comparison = await VATBookService.getQuarterlyVATComparison(Number(year));

            return res.status(200).json({
                success: true,
                message: "Comparación trimestral generada correctamente",
                data: comparison
            });

        } catch (error) {
            console.error('Error en getQuarterlyVATComparison:', error);
            return res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor"
            });
        }
    }

    /**
     * Obtiene configuración del libro de IVA
     */
    static async getVATBookConfig(req, res) {
        try {
            const config = await VATBookService.getVATBookConfig();

            return res.status(200).json({
                success: true,
                message: "Configuración del libro de IVA",
                data: config
            });

        } catch (error) {
            console.error('Error en getVATBookConfig:', error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }


}