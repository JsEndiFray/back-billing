import path from 'path';
import fs from 'fs';
import { generateBillPdf } from '../utils/pdfGenerator.js';
import BillsService from '../services/billsServices.js';
import { validate } from '../helpers/nifHelpers.js';
import { ErrorCodes, sendError, sendSuccess, ErrorMessages } from '../errors/index.js';

export default class BillsControllers {
    // Obtener todas las facturas
    static async getAllBills(req, res) {
        try {
            const bills = await BillsService.getAllBills();
            if (!bills || bills.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { taxes: bills });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Búsqueda por número de factura
    static async getBillNumber(req, res) {
        try {
            const { bill_number } = req.params;
            const billNumberSanitized = bill_number.trim();
            if (!billNumberSanitized) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            const bills = await BillsService.getBillByNumber(billNumberSanitized);
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { bills });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Búsqueda por ID de factura
    static async getBillById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const result = await BillsService.getBillById(id);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { bill: result });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Búsqueda por ID del propietario
    static async getOwnersId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const result = await BillsService.getByOwnersId(id);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { bills: result });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Búsqueda por ID del cliente
    static async getByClientsId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const result = await BillsService.getByClientsId(id);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { bills: result });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Búsqueda del historial de facturas por NIF del cliente
    static async getBillsByClientNif(req, res) {
        try {
            const { nif } = req.params;
            if (!validate(nif)) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const result = await BillsService.getBillsByClientNif(nif);
            if (!result || result.length === 0) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { data: result });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Crear una factura
    static async createBill(req, res) {
        try {
            const data = req.body;
            const created = await BillsService.createBill(data);
            if (!created) {
                return sendError(res, ErrorCodes.BILL_CREATE_ERROR);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_CREATE], { Bill: created }, 201);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Actualizar una factura existente
    static async updateBill(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const existing = await BillsService.getBillById(id);
            if (!existing) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            const updated = await BillsService.updateBill(Number(id), updateData);
            if (!updated) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_UPDATE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_UPDATE], { Bill: updated });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Eliminar una factura
    static async deleteBill(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return sendError(res, ErrorCodes.GLOBAL_INVALID_ID);
            }
            const deleted = await BillsService.deleteBill(id);
            if (!deleted) {
                return sendError(res, ErrorCodes.GLOBAL_ERROR_DELETE);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DELETE]);
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Obtener todos los abonos
    static async getAllRefunds(req, res) {
        try {
            const refunds = await BillsService.getAllRefunds();
            if (!refunds || refunds.length === 0) {
                return sendError(res, ErrorCodes.GLOBAL_NOT_FOUND);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.GLOBAL_DATA], { refunds });
        } catch (error) {
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Descargar PDF de factura
    static async downloadPdf(req, res) {
        try {
            const billId = req.params.id;
            const bill = await BillsService.getBillWithDetails(billId);
            if (!bill) {
                return sendError(res, ErrorCodes.BILL_NOT_FOUND);
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `factura_${bill.bill_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            await generateBillPdf(bill, filePath);
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error al descargar el PDF:', err);
                    return sendError(res, ErrorCodes.BILL_PDF_ERROR);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Descargar PDF de abono
    static async downloadRefundPdf(req, res) {
        try {
            const refundId = req.params.id;
            const refund = await BillsService.getRefundWithDetails(refundId);
            if (!refund) {
                return sendError(res, ErrorCodes.BILL_ABONO_NOT_FOUND);
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `abono_${refund.bill_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            const { generateRefundPdf } = await import('../utils/refundPdfGenerator.js');
            await generateRefundPdf(refund, filePath);
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error al descargar el PDF:', err);
                    return sendError(res, ErrorCodes.BILL_PDF_ERROR);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }

    // Crear un abono a partir de una factura existente
    static async createRefund(req, res) {
        try {
            const { originalBillId } = req.body;
            if (!originalBillId) {
                return sendError(res, ErrorCodes.BILL_ID_REQUIRED);
            }
            const refund = await BillsService.createRefund(originalBillId);
            if (!refund) {
                return sendError(res, ErrorCodes.BILL_ABONO_ERROR);
            }
            return sendSuccess(res, ErrorMessages[ErrorCodes.BILL_ABONO_OK], { refund }, 201);
        } catch (error) {
            console.error('Error al crear abono:', error);
            return sendError(res, ErrorCodes.GLOBAL_SERVER_ERROR);
        }
    }
}
