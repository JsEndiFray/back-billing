import InvoicesReceivedService from '../services/invoicesReceivedServices.js';
import { localFileService } from "../services/fileService.js";
import path from 'path';
import fs from 'fs';
import {
    createInvoiceReceivedDTO,
    updateInvoiceReceivedDTO,
    paymentStatusDTO,
    receivedRefundDTO,
    receivedDateRangeDTO,
    receivedProportionalDateRangeDTO,
    receivedProportionalSimulationDTO,
} from '../dto/invoiceReceived.dto.js';

export default class InvoicesReceivedController {

    static async getAllInvoicesReceived(req, res, next) {
        try {
            const invoices = await InvoicesReceivedService.getAllInvoicesReceived();
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas recibidas" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoiceById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const invoice = await InvoicesReceivedService.getInvoiceById(id);
            if (!invoice || invoice.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            return res.status(200).json({ success: true, data: invoice[0] });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoiceByNumber(req, res, next) {
        try {
            const { invoice_number } = req.params;
            if (!invoice_number || invoice_number.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Número de factura requerido" });
            }
            const invoice = await InvoicesReceivedService.getInvoiceByNumber(invoice_number);
            if (!invoice || invoice.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada con ese número" });
            }
            return res.status(200).json({ success: true, data: invoice });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesBySupplierId(req, res, next) {
        try {
            const { supplier_id } = req.params;
            if (!supplier_id || isNaN(Number(supplier_id))) {
                return res.status(400).json({ success: false, message: "ID de proveedor inválido" });
            }
            const invoices = await InvoicesReceivedService.getInvoicesBySupplierId(supplier_id);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas para este proveedor" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByCategory(req, res, next) {
        try {
            const { category } = req.params;
            if (!category || category.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Categoría requerida" });
            }
            const invoices = await InvoicesReceivedService.getInvoicesByCategory(category);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas para esta categoría" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByDateRange(req, res, next) {
        try {
            const dto = receivedDateRangeDTO(req.body);
            if (!dto.startDate || !dto.endDate) {
                return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
            }
            const invoices = await InvoicesReceivedService.getInvoicesByDateRange(dto.startDate, dto.endDate);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas en ese rango de fechas" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByPaymentStatus(req, res, next) {
        try {
            const { status } = req.params;
            if (!status || status.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Estado de pago requerido" });
            }
            const invoices = await InvoicesReceivedService.getInvoicesByPaymentStatus(status);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas con ese estado de pago" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getOverdueInvoices(req, res, next) {
        try {
            const invoices = await InvoicesReceivedService.getOverdueInvoices();
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No hay facturas vencidas" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesDueSoon(req, res, next) {
        try {
            const { days } = req.query;
            const daysNumber = days ? Number(days) : 7;
            const invoices = await InvoicesReceivedService.getInvoicesDueSoon(daysNumber);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No hay facturas próximas a vencer" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async createInvoiceReceived(req, res, next) {
        try {
            const dto = createInvoiceReceivedDTO(req.body);
            if (req.file) {
                try {
                    const fileUploadResult = await localFileService.uploadInvoiceFile(
                        req.file.buffer,
                        req.file.originalname,
                        dto.invoice_number,
                        dto.invoice_date,
                        'invoices-received'
                    );
                    dto.has_attachments = true;
                    dto.pdf_path = fileUploadResult.fileId;
                } catch (fileError) {
                    return next(fileError);
                }
            }
            const created = await InvoicesReceivedService.createInvoiceReceived(dto);
            if (!created || created.length === 0) {
                return res.status(400).json({ success: false, message: "Error en los datos proporcionados" });
            }
            return res.status(201).json({ success: true, data: created[0] });
        } catch (error) {
            next(error);
        }
    }

    static async updateInvoiceReceived(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de factura inválido" });
            }
            const dto = updateInvoiceReceivedDTO(req.body);
            if (req.file) {
                try {
                    const fileUploadResult = await localFileService.uploadInvoiceFile(
                        req.file.buffer,
                        req.file.originalname,
                        dto.invoice_number || `invoice-${id}`,
                        dto.invoice_date,
                        'invoices-received'
                    );
                    dto.has_attachments = true;
                    dto.pdf_path = fileUploadResult.fileId;
                } catch (fileError) {
                    return next(fileError);
                }
            }
            const updated = await InvoicesReceivedService.updateInvoiceReceived(Number(id), dto);
            if (!updated || updated.length === 0) {
                return res.status(400).json({ success: false, message: "Error al actualizar factura" });
            }
            return res.status(200).json({ success: true, data: updated[0] });
        } catch (error) {
            next(error);
        }
    }

    static async deleteInvoiceReceived(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de factura inválido" });
            }
            const deleted = await InvoicesReceivedService.deleteInvoiceReceived(id);
            if (!deleted || deleted.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async updatePaymentStatus(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de factura inválido" });
            }
            const dto = paymentStatusDTO(req.body);
            if (!dto.payment_status || !dto.payment_method) {
                return res.status(400).json({ success: false, message: "Estado y método de pago son requeridos" });
            }
            const paymentData = {
                collection_status: dto.payment_status,
                collection_method: dto.payment_method,
                collection_date: dto.payment_date,
                collection_reference: dto.payment_reference,
                collection_notes: dto.payment_notes,
            };
            const updated = await InvoicesReceivedService.updatePaymentStatus(Number(id), paymentData);
            if (!updated || updated.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada o datos inválidos" });
            }
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async getAllRefunds(req, res, next) {
        try {
            const refunds = await InvoicesReceivedService.getAllRefunds();
            if (!refunds || refunds.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron abonos" });
            }
            return res.status(200).json({ success: true, data: refunds });
        } catch (error) {
            next(error);
        }
    }

    static async createRefund(req, res, next) {
        try {
            const dto = receivedRefundDTO(req.body);
            if (!dto.originalInvoiceId) {
                return res.status(400).json({ success: false, message: "ID de factura original requerido" });
            }
            const refund = await InvoicesReceivedService.createRefund(dto.originalInvoiceId, dto.refundReason);
            if (!refund || refund.length === 0) {
                return res.status(400).json({ success: false, message: "Error al crear abono o factura original no encontrada" });
            }
            return res.status(201).json({ success: true, data: refund[0] });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoiceStats(req, res, next) {
        try {
            const stats = await InvoicesReceivedService.getInvoiceStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getStatsByCategory(req, res, next) {
        try {
            const stats = await InvoicesReceivedService.getStatsByCategory();
            if (!stats || stats.length === 0) {
                return res.status(404).json({ success: false, message: "No hay estadísticas disponibles" });
            }
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getVATBookData(req, res, next) {
        try {
            const { year } = req.params;
            const { month } = req.query;
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ success: false, message: "Año requerido y debe ser válido" });
            }
            const vatData = await InvoicesReceivedService.getVATBookData(year, month);
            if (!vatData || vatData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de IVA para el período especificado" });
            }
            return res.status(200).json({ success: true, data: vatData });
        } catch (error) {
            next(error);
        }
    }

    static async downloadPdf(req, res, next) {
        try {
            const invoiceId = req.params.id;
            const invoice = await InvoicesReceivedService.getInvoiceById(invoiceId);
            if (!invoice || invoice.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `factura_recibida_${invoice[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            const { generateReceivedInvoicePdf } = await import('../shared/utils/Pdf-Received/invoicePdfGenerator.js');
            await generateReceivedInvoicePdf(invoice[0], filePath);
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) next(err);
            });
        } catch (error) {
            next(error);
        }
    }

    static async downloadRefundPdf(req, res, next) {
        try {
            const refundId = req.params.id;
            const refund = await InvoicesReceivedService.getRefundById(refundId);
            if (!refund || refund.length === 0) {
                return res.status(404).json({ success: false, message: "Abono no encontrado" });
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `abono_recibido_${refund[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            const { generateReceivedInvoicePdf } = await import('../shared/utils/Pdf-Received/invoicePdfGenerator.js');
            await generateReceivedInvoicePdf(refund[0], filePath);
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) next(err);
            });
        } catch (error) {
            next(error);
        }
    }

    static async validateProportionalDateRange(req, res, next) {
        try {
            const dto = receivedProportionalDateRangeDTO(req.body);
            if (!dto.start_date || !dto.end_date) {
                return res.status(400).json({ success: false, isValid: false, message: "Fechas de inicio y fin son requeridas" });
            }
            const validation = InvoicesReceivedService.validateProportionalDateRange(dto.start_date, dto.end_date);
            return res.status(validation.isValid ? 200 : 400).json(validation);
        } catch (error) {
            next(error);
        }
    }

    static async simulateProportionalInvoice(req, res, next) {
        try {
            const dto = receivedProportionalSimulationDTO(req.body);
            if (!dto.tax_base || dto.tax_base <= 0) {
                return res.status(400).json({ success: false, message: "Base imponible debe ser mayor a 0" });
            }
            if (!dto.start_date || !dto.end_date) {
                return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
            }
            const result = InvoicesReceivedService.simulateProportionalInvoice(dto);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getProportionalCalculationDetails(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de factura inválido" });
            }
            const invoice = await InvoicesReceivedService.getInvoiceById(Number(id));
            if (!invoice || invoice.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            const details = InvoicesReceivedService.getProportionalCalculationDetails(invoice[0]);
            return res.status(200).json({ success: true, data: details });
        } catch (error) {
            next(error);
        }
    }

    static async getExpenseStatement(req, res, next) {
        try {
            const { year } = req.params;
            const { month } = req.query;
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ success: false, message: "Año requerido y debe ser válido" });
            }
            const yearNum = Number(year);
            const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
                ? Number(month) : null;
            const expenseData = await InvoicesReceivedService.getStatsByCategory(yearNum, validMonth);
            if (!expenseData || expenseData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de gastos para el período especificado" });
            }
            return res.status(200).json({ success: true, data: expenseData });
        } catch (error) {
            next(error);
        }
    }

    static async getMonthlySummary(req, res, next) {
        try {
            const { year } = req.params;
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ success: false, message: "Año requerido y debe ser válido" });
            }
            const monthlyData = await InvoicesReceivedService.getStatsByCategory(Number(year));
            if (!monthlyData || monthlyData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de facturas para el año especificado" });
            }
            return res.status(200).json({ success: true, data: monthlyData });
        } catch (error) {
            next(error);
        }
    }

    static async getPendingInvoicesAging(req, res, next) {
        try {
            const agingData = await InvoicesReceivedService.getOverdueInvoices();
            if (!agingData || agingData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay facturas pendientes" });
            }
            return res.status(200).json({ success: true, data: agingData });
        } catch (error) {
            next(error);
        }
    }

    static async downloadAttachment(req, res, next) {
        try {
            const { fileName } = req.params;
            if (!fileName || !fileName.endsWith('.pdf')) {
                return res.status(400).json({ success: false, message: "Nombre de archivo inválido" });
            }
            const filePath = localFileService.getFilePath(fileName);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, message: "Archivo no encontrado" });
            }
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) next(err);
            });
        } catch (error) {
            next(error);
        }
    }
}
