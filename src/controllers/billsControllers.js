/**
 * @fileoverview Controlador para la gestión de facturas y abonos
 *
 * Maneja todas las operaciones CRUD relacionadas con facturas y abonos,
 * incluyendo búsquedas específicas, generación de PDFs y creación de
 * facturas rectificativas (abonos).
 *
 * @requires path
 * @requires fs
 * @requires ../utils/pdfGenerator.js
 * @requires ../services/billsServices.js
 * @requires ../helpers/nifHelpers.js
 * @author Tu Nombre
 * @since 1.0.0
 */

import path from 'path';
import fs from 'fs';
import {generateBillPdf} from '../utils/pdfGenerator.js';
import BillsService from '../services/billsServices.js';
import {validate} from '../helpers/nifHelpers.js';

/**
 * Controlador para la gestión de facturas y abonos
 *
 * Proporciona endpoints para todas las operaciones relacionadas con
 * el sistema de facturación, desde consultas básicas hasta generación
 * de documentos PDF.
 */
export default class BillsControllers {

    /**
     * Obtiene todas las facturas del sistema
     *
     * @async
     * @function getAllBills
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills
     * // Response: [{ id: 1, bill_number: "FACT-0001", ... }]
     */
    static async getAllBills(req, res) {
        try {
            const bills = await BillsService.getAllBills();
            if (!bills || bills.length === 0) {
                return res.status(404).json("No se encontraron facturas");
            }
            return res.status(200).json(bills);
        } catch (error) {
            console.log(error)
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca una factura por su número de factura
     *
     * @async
     * @function getBillNumber
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/search/FACT-0001
     * // Response: { id: 1, bill_number: "FACT-0001", ... }
     */
    static async getBillNumber(req, res) {
        try {
            const {bill_number} = req.params;
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

    /**
     * Obtiene una factura específica por su ID
     *
     * @async
     * @function getBillById
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/123
     * // Response: { id: 123, bill_number: "FACT-0123", ... }
     */
    static async getBillById(req, res) {
        try {
            const {id} = req.params;
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

    /**
     * Obtiene todas las facturas de un propietario específico
     *
     * @async
     * @function getOwnersId
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/owners/5
     * // Response: [{ id: 1, owner_name: "Juan", ... }, ...]
     */
    static async getOwnersId(req, res) {
        try {
            const {id} = req.params;
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

    /**
     * Obtiene todas las facturas de un cliente específico por ID
     *
     * @async
     * @function getByClientsId
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/clients/10
     * // Response: [{ id: 1, client_name: "María", ... }, ...]
     */
    static async getByClientsId(req, res) {
        try {
            const {id} = req.params;
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

    /**
     * Obtiene el historial de facturas de un cliente por su NIF
     *
     * Útil para consultas desde el frontend donde solo se conoce
     * el NIF del cliente pero no su ID interno.
     *
     * @async
     * @function getBillsByClientNif
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/clients/nif/12345678Z
     * // Response: [{ id: 1, client_name: "Ana", ... }, ...]
     */
    static async getBillsByClientNif(req, res) {
        try {
            const {nif} = req.params;
            // Validación de formato NIF/NIE/CIF usando helper
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

    /**
     * Crea una nueva factura en el sistema
     *
     * Genera automáticamente el número de factura y calcula
     * el total basado en base imponible, IVA e IRPF.
     *
     * @async
     * @function createBill
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/bills
     * // Body: { owners_id: 1, clients_id: 2, estate_id: 3, tax_base: 1000, iva: 21, irpf: 15 }
     * // Response: { id: 123, bill_number: "FACT-0123", total: 1060, ... }
     */
    static async createBill(req, res) {
        try {
            const data = req.body;
            const created = await BillsService.createBill(data);
            if (!created) {
                console.log(created)
                return res.status(400).json("Error al crear factura");
            }
            return res.status(201).json(created);
        } catch (error) {
            console.log(error)
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Actualiza una factura existente
     *
     * Recalcula automáticamente el total cuando se modifican
     * la base imponible, IVA o IRPF.
     *
     * @async
     * @function updateBill
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/bills/123
     * // Body: { tax_base: 1200, iva: 21, irpf: 15 }
     * // Response: { id: 123, total: 1272, ... }
     */
    static async updateBill(req, res) {
        try {
            const {id} = req.params;
            const updateData = req.body;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            // Verificar que la factura existe antes de actualizar
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

    /**
     * Elimina una factura del sistema
     *
     * @async
     * @function deleteBill
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // DELETE /api/bills/123
     * // Response: 204 No Content
     */
    static async deleteBill(req, res) {
        try {
            const {id} = req.params;
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

    /**
     * Obtiene todos los abonos (facturas rectificativas) del sistema
     *
     * @async
     * @function getAllRefunds
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/refunds
     * // Response: [{ id: 1, bill_number: "ABONO-0001", ... }]
     */
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

    /**
     * Genera y descarga un PDF de una factura específica
     *
     * Obtiene todos los detalles de la factura (cliente, propietario, inmueble)
     * y genera un PDF profesional para descarga.
     *
     * @async
     * @function downloadPdf
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/123/pdf
     * // Response: Archivo PDF para descarga
     */
    static async downloadPdf(req, res) {
        try {
            const billId = req.params.id;

            // Obtener factura con todos los detalles necesarios para el PDF
            const bill = await BillsService.getBillWithDetails(billId);
            if (!bill) {
                return res.status(404).json("Factura no encontrada");
            }

            // Crear directorio para PDFs si no existe
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            // Generar nombre de archivo seguro (reemplazar / por -)
            const fileName = `factura_${bill.bill_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);

            // Generar PDF usando el generador de facturas
            await generateBillPdf(bill, filePath);

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err) {
                    return res.status(500).json("Error al generar PDF");
                }
            });
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Genera y descarga un PDF de un abono específico
     *
     * Similar al PDF de facturas pero con formato específico
     * para abonos (facturas rectificativas).
     *
     * @async
     * @function downloadRefundPdf
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/bills/refunds/123/pdf
     * // Response: Archivo PDF de abono para descarga
     */
    static async downloadRefundPdf(req, res) {
        try {
            const refundId = req.params.id;

            // Obtener abono con todos los detalles necesarios
            const refund = await BillsService.getRefundWithDetails(refundId);
            if (!refund) {
                return res.status(404).json("Abono no encontrado");
            }

            // Crear directorio para PDFs si no existe
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            // Generar nombre de archivo para abono
            const fileName = `abono_${refund.bill_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);

            // Importar generador de PDFs de abono dinámicamente
            const {generateRefundPdf} = await import('../utils/refundPdfGenerator.js');
            await generateRefundPdf(refund, filePath);

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err) {
                    return res.status(500).json("Error al generar PDF");
                }
            });
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Crea un abono (factura rectificativa) a partir de una factura existente
     *
     * Genera automáticamente un abono con valores negativos basado en
     * una factura original, útil para anulaciones o devoluciones.
     *
     * @async
     * @function createRefund
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/bills/refunds
     * // Body: { originalBillId: 123 }
     * // Response: { id: 124, bill_number: "ABONO-0001", total: -1060, ... }
     */
    static async createRefund(req, res) {
        try {
            const {originalBillId} = req.body;
            if (!originalBillId) {
                return res.status(400).json("ID de factura original requerido");
            }

            const refund = await BillsService.createRefund(originalBillId);
            if (!refund) {
                return res.status(400).json("Error al crear abono");
            }
            return res.status(201).json(refund);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }


}