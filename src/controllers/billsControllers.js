import path from 'path';
import fs from 'fs';
import { generateBillPdf } from '../utils/pdfGenerator.js';
import BillsService from '../services/billsServices.js';
import { validate } from '../helpers/nifHelpers.js';

export default class BillsControllers {
    // Obtener todas las facturas
    static async getAllBills(req, res) {
        try {
            const bills = await BillsService.getAllBills();
            if (!bills || bills.length === 0) {
                return res.status(404).json("No se encontraron facturas");
            }
            return res.status(200).json(bills);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por número de factura
    static async getBillNumber(req, res) {
        try {
            const { bill_number } = req.params;
            const billNumberSanitized = bill_number.trim();
            if (!billNumberSanitized) {
                return res.status(404).json("Factura no encontrada");
            }
            const bills = await BillsService.getBillByNumber(billNumberSanitized);
            return res.status(200).json(bills);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por ID de factura
    static async getBillById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await BillsService.getBillById(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por ID del propietario
    static async getOwnersId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await BillsService.getByOwnersId(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Facturas no encontradas");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda por ID del cliente
    static async getByClientsId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await BillsService.getByClientsId(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Facturas no encontradas");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Búsqueda del historial de facturas por NIF del cliente
    static async getBillsByClientNif(req, res) {
        try {
            const { nif } = req.params;
            if (!validate(nif)) {
                return res.status(400).json("NIF inválido");
            }
            const result = await BillsService.getBillsByClientNif(nif);
            if (!result || result.length === 0) {
                return res.status(404).json("Facturas no encontradas");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Crear una factura
    static async createBill(req, res) {
        try {
            const data = req.body;
            const created = await BillsService.createBill(data);
            if (!created) {
                return res.status(400).json("Error al crear factura");
            }
            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Actualizar una factura existente
    static async updateBill(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const existing = await BillsService.getBillById(id);
            if (!existing) {
                return res.status(404).json("Factura no encontrada");
            }
            const updated = await BillsService.updateBill(Number(id), updateData);
            if (!updated) {
                return res.status(400).json("Error al actualizar factura");
            }
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Eliminar una factura
    static async deleteBill(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await BillsService.deleteBill(id);
            if (!deleted) {
                return res.status(400).json("Error al eliminar factura");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Obtener todos los abonos
    static async getAllRefunds(req, res) {
        try {
            const refunds = await BillsService.getAllRefunds();
            if (!refunds || refunds.length === 0) {
                return res.status(404).json("No se encontraron abonos");
            }
            return res.status(200).json(refunds);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Descargar PDF de factura
    static async downloadPdf(req, res) {
        try {
            const billId = req.params.id;
            const bill = await BillsService.getBillWithDetails(billId);
            if (!bill) {
                return res.status(404).json("Factura no encontrada");
            }
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const fileName = `factura_${bill.bill_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);
            await generateBillPdf(bill, filePath);
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error al descargar el PDF:', err);
                    return res.status(500).json("Error al generar PDF");
                }
            });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Descargar PDF de abono
    static async downloadRefundPdf(req, res) {
        try {
            const refundId = req.params.id;
            const refund = await BillsService.getRefundWithDetails(refundId);
            if (!refund) {
                return res.status(404).json("Abono no encontrado");
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
                    return res.status(500).json("Error al generar PDF");
                }
            });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Crear un abono a partir de una factura existente
    static async createRefund(req, res) {
        try {
            const { originalBillId } = req.body;
            if (!originalBillId) {
                return res.status(400).json("ID de factura original requerido");
            }
            const refund = await BillsService.createRefund(originalBillId);
            if (!refund) {
                return res.status(400).json("Error al crear abono");
            }
            return res.status(201).json(refund);
        } catch (error) {
            console.error('Error al crear abono:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }
}