import InvoicesReceivedService from '../services/invoicesReceivedServices.js';
import {localFileService} from "../services/fileService.js";
import path from 'path';
import fs from 'fs';

/**
 * Controlador para la gestión de facturas recibidas de proveedores
 * Maneja todas las operaciones HTTP relacionadas con facturas de proveedores
 * Incluye gestión fiscal de IVA soportado y libro de IVA
 */
export default class InvoicesReceivedController {

    /**
     * Obtiene todas las facturas recibidas
     *
     * @async
     * @function getAllInvoicesReceived
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received
     * // Response: [{ id: 1, invoice_number: "FAC-2024-001", supplier_name: "Iberdrola", ... }]
     */
    static async getAllInvoicesReceived(req, res, next) {
        try {
            const invoices = await InvoicesReceivedService.getAllInvoicesReceived();

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas recibidas");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene una factura específica por su ID
     *
     * @async
     * @function getInvoiceById
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/123
     * // Response: { id: 123, invoice_number: "FAC-2024-001", ... }
     */
    static async getInvoiceById(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const invoice = await InvoicesReceivedService.getInvoiceById(id);

            if (!invoice || invoice.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }

            return res.status(200).json(invoice[0]);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca facturas por número de factura del proveedor
     *
     * @async
     * @function getInvoiceByNumber
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/search/FAC-2024-001
     * // Response: { id: 1, invoice_number: "FAC-2024-001", ... }
     */
    static async getInvoiceByNumber(req, res, next) {
        try {
            const {invoice_number} = req.params;

            if (!invoice_number || invoice_number.trim().length === 0) {
                return res.status(400).json("Número de factura requerido");
            }

            const invoice = await InvoicesReceivedService.getInvoiceByNumber(invoice_number);

            if (!invoice || invoice.length === 0) {
                return res.status(404).json("Factura no encontrada con ese número");
            }

            return res.status(200).json(invoice);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca facturas por proveedor
     *
     * @async
     * @function getInvoicesBySupplierId
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/supplier/5
     * // Response: [{ id: 1, supplier_name: "Iberdrola", ... }, ...]
     */
    static async getInvoicesBySupplierId(req, res, next) {
        try {
            const {supplier_id} = req.params;

            if (!supplier_id || isNaN(Number(supplier_id))) {
                return res.status(400).json("ID de proveedor inválido");
            }

            const invoices = await InvoicesReceivedService.getInvoicesBySupplierId(supplier_id);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas para este proveedor");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca facturas por categoría
     *
     * @async
     * @function getInvoicesByCategory
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/category/electricidad
     * // Response: [{ id: 1, category: "electricidad", ... }, ...]
     */
    static async getInvoicesByCategory(req, res, next) {
        try {
            const {category} = req.params;

            if (!category || category.trim().length === 0) {
                return res.status(400).json("Categoría requerida");
            }

            const invoices = await InvoicesReceivedService.getInvoicesByCategory(category);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas para esta categoría");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca facturas por rango de fechas
     *
     * @async
     * @function getInvoicesByDateRange
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-received/date-range
     * // Body: { startDate: "2024-01-01", endDate: "2024-12-31" }
     * // Response: [{ id: 1, invoice_date: "2024-06-15", ... }, ...]
     */
    static async getInvoicesByDateRange(req, res, next) {
        try {
            const {startDate, endDate} = req.body;

            if (!startDate || !endDate) {
                return res.status(400).json("Fechas de inicio y fin son requeridas");
            }

            const invoices = await InvoicesReceivedService.getInvoicesByDateRange(startDate, endDate);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas en ese rango de fechas");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca facturas por estado de pago
     *
     * @async
     * @function getInvoicesByPaymentStatus
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/payment-status/pending
     * // Response: [{ id: 1, payment_status: "pending", ... }, ...]
     */
    static async getInvoicesByPaymentStatus(req, res, next) {
        try {
            const {status} = req.params;

            if (!status || status.trim().length === 0) {
                return res.status(400).json("Estado de pago requerido");
            }

            const invoices = await InvoicesReceivedService.getInvoicesByPaymentStatus(status);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas con ese estado de pago");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene facturas vencidas
     *
     * @async
     * @function getOverdueInvoices
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/overdue
     * // Response: [{ id: 1, due_date: "2024-01-15", days_overdue: 30, ... }, ...]
     */
    static async getOverdueInvoices(req, res, next) {
        try {
            const invoices = await InvoicesReceivedService.getOverdueInvoices();

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No hay facturas vencidas");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene facturas próximas a vencer
     *
     * @async
     * @function getInvoicesDueSoon
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/due-soon?days=7
     * // Response: [{ id: 1, due_date: "2024-07-25", days_until_due: 5, ... }, ...]
     */
    static async getInvoicesDueSoon(req, res, next) {
        try {
            const {days} = req.query;
            const daysNumber = days ? Number(days) : 7;

            const invoices = await InvoicesReceivedService.getInvoicesDueSoon(daysNumber);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No hay facturas próximas a vencer");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Crea una nueva factura recibida
     *
     * @async
     * @function createInvoiceReceived
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-received
     * // Body: {
     * //   invoice_number: "FAC-2024-001",
     * //   supplier_id: 5,
     * //   invoice_date: "2024-07-19",
     * //   tax_base: 1000,
     * //   iva_percentage: 21,
     * //   category: "electricidad",
     * //   description: "Factura de electricidad julio"
     * // }
     */
    static async createInvoiceReceived(req, res, next) {
        try {
            const data = req.body;
            // Manejar archivo adjunto si existe
            let fileUploadResult = null;

            if (req.file) {
                try {
                    const fileUploadResult = await localFileService.uploadInvoiceFile(
                        req.file.buffer,
                        req.file.originalname,
                        data.invoice_number,
                        data.invoice_date,        // ⬅️ NUEVO: Fecha de la factura
                        'invoices-received'       // ⬅️ NUEVO: Tipo de archivo
                    );
                    data.has_attachments = true;
                    data.pdf_path = fileUploadResult.fileId;
                } catch (fileError) {
                    return next(fileError);
                }
            }


            const created = await InvoicesReceivedService.createInvoiceReceived(data);

            if (!created || created.length === 0) {
                return res.status(400).json("Error en los datos proporcionados");
            }

            return res.status(201).json({
                message: "Factura recibida creada correctamente",
                invoice: created[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza una factura recibida existente
     *
     * @async
     * @function updateInvoiceReceived
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/invoices-received/123
     * // Body: { tax_base: 1200, iva_percentage: 21 }
     * // Response: { message: "Factura actualizada", invoices: {...} }
     */
    static async updateInvoiceReceived(req, res, next) {
        try {
            const {id} = req.params;
            const updateData = req.body;

            //Manejar archivo adjunto si existe
            if (req.file) {
                try {
                    const fileUploadResult = await localFileService.uploadInvoiceFile(
                        req.file.buffer,
                        req.file.originalname,
                        updateData.invoice_number || `invoice-${id}`,
                        updateData.invoice_date,      // ⬅️ NUEVO: Fecha de la factura
                        'invoices-received'           // ⬅️ NUEVO: Tipo de archivo
                    );
                    updateData.has_attachments = true;
                    updateData.pdf_path = fileUploadResult.fileId;
                } catch (fileError) {
                    return next(fileError);
                }
            }

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de factura inválido");
            }

            const updated = await InvoicesReceivedService.updateInvoiceReceived(Number(id), updateData);

            if (!updated || updated.length === 0) {
                return res.status(400).json("Error al actualizar factura");
            }

            return res.status(200).json({
                message: "Factura actualizada correctamente",
                invoice: updated[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Elimina una factura recibida
     *
     * @async
     * @function deleteInvoiceReceived
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // DELETE /api/invoices-received/123
     * // Response: 204 No Content
     */
    static async deleteInvoiceReceived(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de factura inválido");
            }

            const deleted = await InvoicesReceivedService.deleteInvoiceReceived(id);

            if (!deleted || deleted.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza el estado de pago de una factura
     *
     * @async
     * @function updateCollectionStatus
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/invoices-received/123/payment
     * // Body: {
     * //   payment_status: "paid",
     * //   payment_method: "transfer",
     * //   payment_date: "2024-07-19",
     * //   payment_reference: "TRF-001"
     * // }
     */
    static async updatePaymentStatus(req, res, next) {
        try {
            const {id} = req.params;
            const {
                payment_status,
                payment_method,
                payment_date,
                payment_reference,
                payment_notes
            } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de factura inválido");
            }

            if (!payment_status || !payment_method) {
                return res.status(400).json("Estado y método de pago son requeridos");
            }

            // Map API field names (payment_*) to internal storage names (collection_*)
            const paymentData = {
                collection_status: payment_status,
                collection_method: payment_method,
                collection_date: payment_date || null,
                collection_reference: payment_reference || null,
                collection_notes: payment_notes || null
            };

            const updated = await InvoicesReceivedService.updatePaymentStatus(Number(id), paymentData);

            if (!updated || updated.length === 0) {
                return res.status(404).json("Factura no encontrada o datos inválidos");
            }

            return res.status(200).json({
                message: "Estado de pago actualizado correctamente",
                invoice: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los abonos
     *
     * @async
     * @function getAllRefunds
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/refunds
     * // Response: [{ id: 1, invoice_number: "ABONO-FAC-2024-001", ... }]
     */
    static async getAllRefunds(req, res, next) {
        try {
            const refunds = await InvoicesReceivedService.getAllRefunds();

            if (!refunds || refunds.length === 0) {
                return res.status(404).json("No se encontraron abonos");
            }

            return res.status(200).json(refunds);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Crea un abono basado en una factura original
     *
     * @async
     * @function createRefund
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-received/refunds
     * // Body: { originalInvoiceId: 123, refundReason: "Error en facturación" }
     * // Response: { id: 124, invoice_number: "ABONO-FAC-2024-001", ... }
     */
    static async createRefund(req, res, next) {
        try {
            const {originalInvoiceId, refundReason} = req.body;

            if (!originalInvoiceId) {
                return res.status(400).json("ID de factura original requerido");
            }

            const refund = await InvoicesReceivedService.createRefund(originalInvoiceId, refundReason);

            if (!refund || refund.length === 0) {
                return res.status(400).json("Error al crear abono o factura original no encontrada");
            }

            return res.status(201).json({
                message: "Abono creado correctamente",
                refund: refund[0]
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene estadísticas generales de facturas recibidas
     *
     * @async
     * @function getInvoiceStats
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/stats
     * // Response: {
     * //   total_invoices: 150,
     * //   pending_invoices: 25,
     * //   total_amount: 45000.50,
     * //   total_iva: 9450.11
     * // }
     */
    static async getInvoiceStats(req, res, next) {
        try {
            const stats = await InvoicesReceivedService.getInvoiceStats();
            return res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene estadísticas por categoría
     *
     * @async
     * @function getStatsByCategory
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/stats/category
     * // Response: [
     * //   { category: "electricidad", invoice_count: 12, total_amount: 15000 },
     * //   { category: "gas", invoice_count: 8, total_amount: 5000 }
     * // ]
     */
    static async getStatsByCategory(req, res, next) {
        try {
            const stats = await InvoicesReceivedService.getStatsByCategory();

            if (!stats || stats.length === 0) {
                return res.status(404).json("No hay estadísticas disponibles");
            }

            return res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene datos para el libro de IVA soportado
     *
     * @async
     * @function getVATBookData
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/vat-book/2024?month=7
     * // Response: [
     * //   {
     * //     invoice_date: "2024-07-15",
     * //     invoice_number: "FAC-001",
     * //     supplier_name: "Iberdrola",
     * //     tax_base: 1000,
     * //     iva_amount: 210
     * //   }
     * // ]
     */
    static async getVATBookData(req, res, next) {
        try {
            const {year} = req.params;
            const {month} = req.query;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const vatData = await InvoicesReceivedService.getVATBookData(year, month);

            if (!vatData || vatData.length === 0) {
                return res.status(404).json("No hay datos de IVA para el período especificado");
            }

            return res.status(200).json(vatData);
        } catch (error) {
            next(error);
        }
    }

    /*MEDOTODOS DE PDF*/

    /**
     * Genera y descarga un PDF de una factura recibida específica
     *
     * @async
     * @function downloadPdf
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/123/pdf
     * // Response: Archivo PDF para descarga
     */
    static async downloadPdf(req, res, next) {
        try {
            const invoiceId = req.params.id;

            // Obtener factura con todos los detalles necesarios para el PDF
            const invoice = await InvoicesReceivedService.getInvoiceById(invoiceId);
            if (!invoice || invoice.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }

            // Crear directorio para PDFs si no existe
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            // Generar nombre de archivo seguro (reemplazar / por -)
            const fileName = `factura_recibida_${invoice[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);

            // Importar generador de PDFs dinámicamente (el mismo para facturas y abonos)
            const {generateReceivedInvoicePdf} = await import('../shared/utils/Pdf-Received/invoicePdfGenerator.js');
            await generateReceivedInvoicePdf(invoice[0], filePath);

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) {
                    next(err);
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Genera y descarga un PDF de un abono específico
     *
     * @async
     * @function downloadRefundPdf
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/refunds/123/pdf
     * // Response: Archivo PDF de abono para descarga
     */
    static async downloadRefundPdf(req, res, next) {
        try {
            const refundId = req.params.id;

            // Obtener abono con todos los detalles necesarios
            const refund = await InvoicesReceivedService.getRefundById(refundId);
            if (!refund || refund.length === 0) {
                return res.status(404).json("Abono no encontrado");
            }

            // Crear directorio para PDFs si no existe
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            // Generar nombre de archivo para abono
            const fileName = `abono_recibido_${refund[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);

            // Importar generador de PDFs dinámicamente (el mismo para facturas y abonos)
            const {generateReceivedInvoicePdf} = await import('../shared/utils/Pdf-Received/invoicePdfGenerator.js');
            await generateReceivedInvoicePdf(refund[0], filePath);

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) {
                    next(err);
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Valida un rango de fechas para facturas proporcionales
     *
     * @async
     * @function validateProportionalDateRange
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-received/validate-proportional-dates
     * // Body: { start_date: "2024-07-17", end_date: "2024-07-31" }
     * // Response: validación del rango de fechas
     */
    static async validateProportionalDateRange(req, res, next) {
        try {
            const {start_date, end_date} = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({
                    isValid: false,
                    message: "Fechas de inicio y fin son requeridas"
                });
            }

            const validation = InvoicesReceivedService.validateProportionalDateRange(start_date, end_date);

            return res.status(validation.isValid ? 200 : 400).json(validation);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Calcula una simulación de factura proporcional sin guardarla
     *
     * @async
     * @function simulateProportionalInvoice
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-received/simulate-proportional
     * // Body: { tax_base: 1000, iva_percentage: 21, irpf_percentage: 15, start_date: "2024-07-17", end_date: "2024-07-31" }
     * // Response: simulación del cálculo proporcional
     */
    static async simulateProportionalInvoice(req, res, next) {
        try {
            const {tax_base, iva_percentage, irpf_percentage, start_date, end_date} = req.body;

            // Validaciones básicas
            if (!tax_base || tax_base <= 0) {
                return res.status(400).json("Base imponible debe ser mayor a 0");
            }

            if (!start_date || !end_date) {
                return res.status(400).json("Fechas de inicio y fin son requeridas");
            }

            const result = InvoicesReceivedService.simulateProportionalInvoice({tax_base, iva_percentage, irpf_percentage, start_date, end_date});
            return res.status(200).json(result);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene detalles del cálculo proporcional de una factura
     *
     * @async
     * @function getProportionalCalculationDetails
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/123/proportional-details
     * // Response: detalles del cálculo proporcional
     */
    static async getProportionalCalculationDetails(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de factura inválido");
            }

            const invoice = await InvoicesReceivedService.getInvoiceById(Number(id));
            if (!invoice || invoice.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }

            const details = InvoicesReceivedService.getProportionalCalculationDetails(invoice[0]);

            return res.status(200).json(details);
        } catch (error) {
            next(error);
        }
    }

// ==========================================
// REPORTES AVANZADOS FALTANTES
// ==========================================

    /**
     * Obtiene balance de gastos
     *
     * @async
     * @function getExpenseStatement
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/expense-statement/2024?month=7
     * // Response: balance de gastos del período
     */
    static async getExpenseStatement(req, res, next) {
        try {
            const {year} = req.params;
            const {month} = req.query;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const yearNum = Number(year);
            const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
                ? Number(month) : null;

            const expenseData = await InvoicesReceivedService.getStatsByCategory(yearNum, validMonth);

            if (!expenseData || expenseData.length === 0) {
                return res.status(404).json("No hay datos de gastos para el período especificado");
            }

            return res.status(200).json(expenseData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene resumen mensual de facturas recibidas
     *
     * @async
     * @function getMonthlySummary
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/monthly-summary/2024
     * // Response: resumen mensual de facturas recibidas del año
     */
    static async getMonthlySummary(req, res, next) {
        try {
            const {year} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const monthlyData = await InvoicesReceivedService.getStatsByCategory(Number(year));

            if (!monthlyData || monthlyData.length === 0) {
                return res.status(404).json("No hay datos de facturas para el año especificado");
            }

            return res.status(200).json(monthlyData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene facturas pendientes con aging (antigüedad)
     *
     * @async
     * @function getPendingInvoicesAging
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/aging
     * // Response: facturas pendientes con información de antigüedad
     */
    static async getPendingInvoicesAging(req, res, next) {
        try {
            // Obtener facturas vencidas como proxy para aging
            const agingData = await InvoicesReceivedService.getOverdueInvoices();

            if (!agingData || agingData.length === 0) {
                return res.status(404).json("No hay facturas pendientes");
            }

            return res.status(200).json(agingData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Descarga un archivo adjunto de factura
     *
     * @async
     * @function downloadAttachment
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-received/files/FAC-001_2024-08-12.pdf
     * // Response: Archivo PDF para descarga
     */
    static async downloadAttachment(req, res, next) {
        try {
            const {fileName} = req.params;

            // Validar nombre de archivo
            if (!fileName || !fileName.endsWith('.pdf')) {
                return res.status(400).json("Nombre de archivo inválido");
            }

            // Construir ruta del archivo
            const filePath = localFileService.getFilePath(fileName);

            // Verificar que el archivo existe
            if (!fs.existsSync(filePath)) {
                return res.status(404).json("Archivo no encontrado");
            }

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) {
                    next(err);
                }
            });

        } catch (error) {
            next(error);
        }
    }


}