import path from 'path';
import fs from 'fs';
import { generateInvoicePdf } from "../shared/utils/Pdf-invoicesIssued/invoicePdfGenerator.js";
import InvoicesIssuedService from '../services/invoicesIssuedServices.js';
import { validate } from '../shared/helpers/nifHelpers.js';
import {
    createInvoiceIssuedDTO,
    updateInvoiceIssuedDTO,
    collectionStatusDTO,
    refundDTO,
    dateRangeDTO,
    proportionalDateRangeDTO,
    proportionalSimulationDTO,
} from '../dto/invoiceIssued.dto.js';

export default class InvoicesIssuedController {

    static async getAllInvoicesIssued(req, res, next) {
        try {
            const invoices = await InvoicesIssuedService.getAllInvoicesIssued();
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas emitidas" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoiceByNumber(req, res, next) {
        try {
            const { invoice_number } = req.params;
            const invoiceNumberSanitized = invoice_number.trim();
            if (!invoiceNumberSanitized) {
                return res.status(400).json({ success: false, message: "Número de factura requerido" });
            }
            const invoices = await InvoicesIssuedService.getInvoiceByNumber(invoiceNumberSanitized);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            return res.status(200).json({ success: true, data: invoices[0] });
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
            const result = await InvoicesIssuedService.getInvoiceById(id);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            return res.status(200).json({ success: true, data: result[0] });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByOwnerId(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await InvoicesIssuedService.getByOwnersId(id);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Facturas no encontradas" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByClientId(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const result = await InvoicesIssuedService.getByClientsId(id);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Facturas no encontradas" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByClientNif(req, res, next) {
        try {
            const { nif } = req.params;
            if (!validate(nif)) {
                return res.status(400).json({ success: false, message: "NIF inválido" });
            }
            const result = await InvoicesIssuedService.getInvoicesByClientNif(nif);
            if (!result || result.length === 0) {
                return res.status(404).json({ success: false, message: "Facturas no encontradas" });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByCollectionStatus(req, res, next) {
        try {
            const { status } = req.params;
            if (!status || status.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Estado de cobro requerido" });
            }
            const invoices = await InvoicesIssuedService.getInvoicesByCollectionStatus(status);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas con ese estado de cobro" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getOverdueInvoices(req, res, next) {
        try {
            const invoices = await InvoicesIssuedService.getOverdueInvoices();
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
            const invoices = await InvoicesIssuedService.getInvoicesDueSoon(daysNumber);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No hay facturas próximas a vencer" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByDateRange(req, res, next) {
        try {
            const dto = dateRangeDTO(req.body);
            if (!dto.startDate || !dto.endDate) {
                return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
            }
            const invoices = await InvoicesIssuedService.getInvoicesByDateRange(dto.startDate, dto.endDate);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas en ese rango de fechas" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoicesByCorrespondingMonth(req, res, next) {
        try {
            const { month } = req.params;
            if (!month || !month.match(/^\d{4}-\d{2}$/)) {
                return res.status(400).json({ success: false, message: "Formato de mes inválido. Use YYYY-MM" });
            }
            const invoices = await InvoicesIssuedService.getInvoicesByCorrespondingMonth(month);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron facturas para ese mes" });
            }
            return res.status(200).json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    static async createInvoice(req, res, next) {
        try {
            const dto = createInvoiceIssuedDTO(req.body);
            const created = await InvoicesIssuedService.createInvoice(dto);
            return res.status(201).json({ success: true, data: created[0] });
        } catch (error) {
            next(error);
        }
    }

    static async updateInvoice(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido." });
            }
            const dto = updateInvoiceIssuedDTO(req.body);
            const updated = await InvoicesIssuedService.updateInvoice(Number(id), dto);
            return res.status(200).json({ success: true, data: updated[0] });
        } catch (error) {
            next(error);
        }
    }

    static async deleteInvoice(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const deleted = await InvoicesIssuedService.deleteInvoice(id);
            if (!deleted || deleted.length === 0) {
                return res.status(400).json({ success: false, message: "Error al eliminar factura o factura no encontrada" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async getAllRefunds(req, res, next) {
        try {
            const refunds = await InvoicesIssuedService.getAllRefunds();
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
            const dto = refundDTO(req.body);
            if (!dto.originalInvoiceId) {
                return res.status(400).json({ success: false, message: "ID de factura original requerido." });
            }
            const refund = await InvoicesIssuedService.createRefund(dto.originalInvoiceId);
            return res.status(201).json({ success: true, data: refund[0] });
        } catch (error) {
            next(error);
        }
    }

    static async updateCollectionStatus(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de factura inválido." });
            }
            const dto = collectionStatusDTO(req.body);
            if (!dto.collection_status || !dto.collection_method) {
                return res.status(400).json({ success: false, message: "Estado y método de cobro son requeridos." });
            }
            const updated = await InvoicesIssuedService.updateCollectionStatus(Number(id), dto);
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async getInvoiceStats(req, res, next) {
        try {
            const stats = await InvoicesIssuedService.getInvoiceStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getStatsByClient(req, res, next) {
        try {
            const stats = await InvoicesIssuedService.getStatsByClient();
            if (!stats || stats.length === 0) {
                return res.status(404).json({ success: false, message: "No hay estadísticas disponibles" });
            }
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getStatsByOwner(req, res, next) {
        try {
            const stats = await InvoicesIssuedService.getStatsByOwner();
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
            const vatData = await InvoicesIssuedService.getVATBookData(year, month);
            if (!vatData || vatData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de IVA para el período especificado" });
            }
            return res.status(200).json({ success: true, data: vatData });
        } catch (error) {
            next(error);
        }
    }

    static async getIncomeStatement(req, res, next) {
        try {
            const { year } = req.params;
            const { month } = req.query;
            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ success: false, message: "Año requerido y debe ser válido" });
            }
            const incomeData = await InvoicesIssuedService.getIncomeStatement(year, month);
            if (!incomeData || incomeData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de ingresos para el período especificado" });
            }
            return res.status(200).json({ success: true, data: incomeData });
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
            const monthlyData = await InvoicesIssuedService.getMonthlySummary(year);
            if (!monthlyData || monthlyData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de facturación para el año especificado" });
            }
            return res.status(200).json({ success: true, data: monthlyData });
        } catch (error) {
            next(error);
        }
    }

    static async getPendingInvoicesAging(req, res, next) {
        try {
            const agingData = await InvoicesIssuedService.getPendingInvoicesAging();
            if (!agingData || agingData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay facturas pendientes" });
            }
            return res.status(200).json({ success: true, data: agingData });
        } catch (error) {
            next(error);
        }
    }

    static async downloadPdf(req, res, next) {
        try {
            const invoiceId = req.params.id;
            const invoice = await InvoicesIssuedService.getInvoiceWithDetails(invoiceId);
            if (!invoice || invoice.length === 0) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `factura_${invoice[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            await generateInvoicePdf(invoice[0], filePath);
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
            const refund = await InvoicesIssuedService.getRefundWithDetails(refundId);
            if (!refund || refund.length === 0) {
                return res.status(404).json({ success: false, message: "Abono no encontrado" });
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `abono_${refund[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            const { generateRefundInvoicePdf } = await import('../shared/utils/pdf/refundInvoicePdfGenerator.js');
            await generateRefundInvoicePdf(refund[0], filePath);
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) next(err);
            });
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
            const details = await InvoicesIssuedService.getProportionalCalculationDetails(Number(id));
            if (!details) {
                return res.status(404).json({ success: false, message: "Factura no encontrada" });
            }
            return res.status(200).json({ success: true, data: details });
        } catch (error) {
            next(error);
        }
    }

    static async validateProportionalDateRange(req, res, next) {
        try {
            const dto = proportionalDateRangeDTO(req.body);
            if (!dto.start_date || !dto.end_date) {
                return res.status(400).json({ success: false, isValid: false, message: "Fechas de inicio y fin son requeridas" });
            }
            const validation = InvoicesIssuedService.validateProportionalDateRange(dto.start_date, dto.end_date);
            return res.status(validation.isValid ? 200 : 400).json(validation);
        } catch (error) {
            next(error);
        }
    }

    static async simulateProportionalBilling(req, res, next) {
        try {
            const dto = proportionalSimulationDTO(req.body);
            if (!dto.tax_base || dto.tax_base <= 0) {
                return res.status(400).json({ success: false, message: "Base imponible debe ser mayor a 0" });
            }
            if (!dto.start_date || !dto.end_date) {
                return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
            }
            const result = InvoicesIssuedService.simulateProportionalBilling(dto);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
