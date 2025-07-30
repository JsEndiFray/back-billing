/**
 * @fileoverview Controlador para la gestión de facturas emitidas y abonos
 *
 * Maneja todas las operaciones CRUD relacionadas con facturas emitidas,
 * incluyendo búsquedas específicas, generación de PDFs y creación de
 * facturas rectificativas (abonos).
 *
 * MIGRADO DESDE: billsControllers.js con adaptaciones
 *
 * @requires path
 * @requires fs
 * @requires ../shared/utils/pdf/invoicePdfGenerator.js // Nueva ruta y nombre
 * @requires ../shared/utils/pdf/refundInvoicePdfGenerator.js // Nueva ruta y nombre
 * @requires ../services/invoicesIssuedServices.js
 * @requires ../shared/helpers/nifHelpers.js
 * @requires ../shared/helpers/calculateTotal.js
 * @author Tu Nombre
 * @since 1.0.0
 */

import path from 'path';
import fs from 'fs';
import {generateInvoicePdf} from "../shared/utils/Pdf-invoicesIssued/invoicePdfGenerator.js";
import InvoicesIssuedService from '../services/invoicesIssuedServices.js';
import { validate } from '../shared/helpers/nifHelpers.js';
import CalculateHelper from "../shared/helpers/calculateTotal.js";

/**
 * Controlador para la gestión de facturas emitidas y abonos
 *
 * Proporciona endpoints para todas las operaciones relacionadas con
 * el sistema de facturación emitida, desde consultas básicas hasta generación
 * de documentos PDF.
 */
export default class InvoicesIssuedController {

    /**
     * Obtiene todas las facturas emitidas del sistema
     *
     * @async
     * @function getAllInvoicesIssued
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued
     * // Response: [{ id: 1, invoice_number: "FACT-0001", ... }]
     */
    static async getAllInvoicesIssued(req, res) {
        try {
            const invoices = await InvoicesIssuedService.getAllInvoicesIssued();
            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas emitidas");
            }
            return res.status(200).json(invoices);
        } catch (error) {
            console.error('Error en getAllInvoicesIssued:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca una factura por su número
     *
     * @async
     * @function getInvoiceByNumber
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/search/FACT-0001
     * // Response: { id: 1, invoice_number: "FACT-0001", ... }
     */
    static async getInvoiceByNumber(req, res) {
        try {
            const { invoice_number } = req.params;
            const invoiceNumberSanitized = invoice_number.trim();
            if (!invoiceNumberSanitized) {
                return res.status(400).json("Número de factura requerido");
            }
            const invoices = await InvoicesIssuedService.getInvoiceByNumber(invoiceNumberSanitized);
            if (!invoices || invoices.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }
            return res.status(200).json(invoices[0]); // Devuelve el primer resultado, asumiendo unicidad
        } catch (error) {
            console.error('Error en getInvoiceByNumber:', error);
            return res.status(500).json("Error interno del servidor");
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
     * // GET /api/invoices-issued/123
     * // Response: { id: 123, invoice_number: "FACT-0123", ... }
     */
    static async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await InvoicesIssuedService.getInvoiceById(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }
            return res.status(200).json(result[0]);
        } catch (error) {
            console.error('Error en getInvoiceById:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene todas las facturas de un propietario específico
     *
     * @async
     * @function getInvoicesByOwnerId
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/owners/5
     * // Response: [{ id: 1, owner_name: "Juan", ... }, ...]
     */
    static async getInvoicesByOwnerId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await InvoicesIssuedService.getByOwnersId(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Facturas no encontradas");
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error en getInvoicesByOwnerId:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene todas las facturas de un cliente específico por ID
     *
     * @async
     * @function getInvoicesByClientId
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/clients/10
     * // Response: [{ id: 1, client_name: "María", ... }, ...]
     */
    static async getInvoicesByClientId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const result = await InvoicesIssuedService.getByClientsId(id);
            if (!result || result.length === 0) {
                return res.status(404).json("Facturas no encontradas");
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error en getInvoicesByClientId:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene el historial de facturas de un cliente por su NIF
     *
     * @async
     * @function getInvoicesByClientNif
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/clients/nif/12345678Z
     * // Response: [{ id: 1, client_name: "Ana", ... }, ...]
     */
    static async getInvoicesByClientNif(req, res) {
        try {
            const { nif } = req.params;
            // Validación de formato NIF/NIE/CIF usando helper
            if (!validate(nif)) {
                return res.status(400).json("NIF inválido");
            }
            const result = await InvoicesIssuedService.getInvoicesByClientNif(nif);
            if (!result || result.length === 0) {
                return res.status(404).json("Facturas no encontradas");
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error en getInvoicesByClientNif:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca facturas por estado de cobro
     *
     * @async
     * @function getInvoicesByCollectionStatus
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/collection-status/pending
     * // Response: [{ id: 1, collection_status: "pending", ... }, ...]
     */
    static async getInvoicesByCollectionStatus(req, res) {
        try {
            const { status } = req.params;

            if (!status || status.trim().length === 0) {
                return res.status(400).json("Estado de cobro requerido");
            }

            const invoices = await InvoicesIssuedService.getInvoicesByCollectionStatus(status);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas con ese estado de cobro");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            console.error('Error en getInvoicesByCollectionStatus:', error);
            return res.status(500).json("Error interno del servidor");
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
     * // GET /api/invoices-issued/overdue
     * // Response: [{ id: 1, due_date: "2024-01-15", days_overdue: 30, ... }, ...]
     */
    static async getOverdueInvoices(req, res) {
        try {
            const invoices = await InvoicesIssuedService.getOverdueInvoices();

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No hay facturas vencidas");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            console.error('Error en getOverdueInvoices:', error);
            return res.status(500).json("Error interno del servidor");
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
     * // GET /api/invoices-issued/due-soon?days=7
     * // Response: [{ id: 1, due_date: "2024-07-25", days_until_due: 5, ... }, ...]
     */
    static async getInvoicesDueSoon(req, res) {
        try {
            const { days } = req.query;
            const daysNumber = days ? Number(days) : 7;

            const invoices = await InvoicesIssuedService.getInvoicesDueSoon(daysNumber);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No hay facturas próximas a vencer");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            console.error('Error en getInvoicesDueSoon:', error);
            return res.status(500).json("Error interno del servidor");
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
     * // POST /api/invoices-issued/date-range
     * // Body: { startDate: "2024-01-01", endDate: "2024-12-31" }
     * // Response: [{ id: 1, invoice_date: "2024-06-15", ... }, ...]
     */
    static async getInvoicesByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.body;

            if (!startDate || !endDate) {
                return res.status(400).json("Fechas de inicio y fin son requeridas");
            }

            const invoices = await InvoicesIssuedService.getInvoicesByDateRange(startDate, endDate);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas en ese rango de fechas");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            console.error('Error en getInvoicesByDateRange:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca facturas por mes de correspondencia
     *
     * @async
     * @function getInvoicesByCorrespondingMonth
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/month/2024-07
     * // Response: [{ id: 1, corresponding_month: "2024-07", ... }, ...]
     */
    static async getInvoicesByCorrespondingMonth(req, res) {
        try {
            const { month } = req.params;

            if (!month || !month.match(/^\d{4}-\d{2}$/)) {
                return res.status(400).json("Formato de mes inválido. Use YYYY-MM");
            }

            const invoices = await InvoicesIssuedService.getInvoicesByCorrespondingMonth(month);

            if (!invoices || invoices.length === 0) {
                return res.status(404).json("No se encontraron facturas para ese mes");
            }

            return res.status(200).json(invoices);
        } catch (error) {
            console.error('Error en getInvoicesByCorrespondingMonth:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Crea una nueva factura emitida en el sistema
     *
     * @async
     * @function createInvoice
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-issued
     * // Body: { owners_id: 1, clients_id: 2, estates_id: 3, tax_base: 1000, iva: 21, irpf: 15 }
     * // Response: { id: 123, invoice_number: "FACT-0123", total: 1060, ... }
     */
    static async createInvoice(req, res) {
        try {
            const data = req.body;
            const created = await InvoicesIssuedService.createInvoice(data);

            if (created === null) {
                // El servicio devuelve null para:
                // 1. Datos obligatorios faltantes
                // 2. Validación de campos proporcionales fallida
                // 3. Factura duplicada (mismo mes, propietario, propiedad, cliente)
                const { owners_id, estates_id, clients_id, invoice_date } = data;

                // Intentar dar un mensaje más específico si es un problema de duplicado
                if (owners_id && estates_id && clients_id && invoice_date) {
                    const month = CalculateHelper.generateCorrespondingMonth(invoice_date, data.corresponding_month);
                    const existingForMonth = await InvoicesIssuedService.getInvoicesByCorrespondingMonth(month);
                    const isDuplicate = existingForMonth.some(inv =>
                        inv.owners_id === Number(owners_id) &&
                        inv.estates_id === Number(estates_id) &&
                        inv.clients_id === Number(clients_id) &&
                        !Boolean(inv.is_refund)
                    );
                    if (isDuplicate) {
                        return res.status(409).json("Ya existe una factura para este cliente en esa propiedad y mes.");
                    }
                }
                // Si llegamos aquí, es un problema de validación de datos o campos proporcionales
                return res.status(400).json("Datos de factura inválidos o faltantes, o error en campos proporcionales.");
            }

            if (!created || created.length === 0) {
                return res.status(500).json("Error al crear factura: La operación no se completó correctamente.");
            }

            return res.status(201).json({
                message: "Factura creada correctamente",
                invoice: created[0]
            });
        } catch (error) {
            console.error('Error en createInvoice:', error);
            return res.status(500).json("Error interno del servidor al crear la factura.");
        }
    }

    /**
     * Actualiza una factura existente
     *
     * @async
     * @function updateInvoice
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/invoices-issued/123
     * // Body: { tax_base: 1200, iva: 21, irpf: 15 }
     * // Response: { id: 123, total: 1272, ... }
     */
    static async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido.");
            }

            const existing = await InvoicesIssuedService.getInvoiceById(id);
            if (!existing || existing.length === 0) {
                return res.status(404).json("Factura no encontrada.");
            }

            const updated = await InvoicesIssuedService.updateInvoice(Number(id), updateData);

            if (updated === null) {
                // El servicio devuelve null para:
                // 1. Validación de campos proporcionales fallida
                // 2. Número de factura duplicado
                // 3. Error genérico de actualización de BD
                if (updateData.invoice_number && updateData.invoice_number !== existing[0].invoice_number) {
                    const invoiceWithSameNumber = await InvoicesIssuedService.getInvoiceByNumber(updateData.invoice_number);
                    if (invoiceWithSameNumber.length > 0) {
                        return res.status(409).json("El número de factura ya existe.");
                    }
                }
                // Si no es un problema de número de factura duplicado, asume validación proporcional o error interno
                return res.status(400).json("Error de validación o datos de actualización inválidos para la factura.");
            }

            if (!updated || updated.length === 0) {
                return res.status(500).json("Error al actualizar factura: La operación no se completó correctamente.");
            }

            return res.status(200).json({
                message: "Factura actualizada correctamente",
                invoice: updated[0]
            });

        } catch (error) {
            console.error('Error en updateInvoice:', error);
            return res.status(500).json("Error interno del servidor al actualizar la factura.");
        }
    }

    /**
     * Elimina una factura del sistema
     *
     * @async
     * @function deleteInvoice
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // DELETE /api/invoices-issued/123
     * // Response: 204 No Content
     */
    static async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }
            const deleted = await InvoicesIssuedService.deleteInvoice(id);
            if (!deleted || deleted.length === 0) {
                return res.status(400).json("Error al eliminar factura o factura no encontrada"); // Más específico
            }
            return res.status(204).send();
        } catch (error) {
            console.error('Error en deleteInvoice:', error);
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
     * // GET /api/invoices-issued/refunds
     * // Response: [{ id: 1, invoice_number: "ABONO-0001", ... }]
     */
    static async getAllRefunds(req, res) {
        try {
            const refunds = await InvoicesIssuedService.getAllRefunds();
            if (!refunds || refunds.length === 0) {
                return res.status(404).json("No se encontraron abonos");
            }
            return res.status(200).json(refunds);
        } catch (error) {
            console.error('Error en getAllRefunds:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Crea un abono (factura rectificativa) a partir de una factura existente
     *
     * @async
     * @function createRefund
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-issued/refunds
     * // Body: { originalInvoiceId: 123 }
     * // Response: { id: 124, invoice_number: "ABONO-0001", total: -1060, ... }
     */
    static async createRefund(req, res) {
        try {
            const { originalInvoiceId } = req.body;
            if (!originalInvoiceId) {
                return res.status(400).json("ID de factura original requerido.");
            }

            const refund = await InvoicesIssuedService.createRefund(originalInvoiceId);

            if (refund === null) {
                // El servicio devuelve null si:
                // 1. La factura original no se encuentra
                // 2. Se intenta abonar un abono (is_refund es true)
                const originalInvoice = await InvoicesIssuedService.getInvoiceById(originalInvoiceId);
                if (!originalInvoice || originalInvoice.length === 0) {
                    return res.status(404).json("Factura original no encontrada.");
                } else if (Boolean(originalInvoice[0].is_refund)) {
                    return res.status(400).json("No se puede crear un abono a partir de otro abono.");
                }
            }

            if (!refund || refund.length === 0) {
                return res.status(500).json("Error al crear abono: La operación no se completó correctamente.");
            }

            return res.status(201).json({
                message: "Abono creado correctamente",
                refund: refund[0]
            });
        } catch (error) {
            console.error('Error en createRefund:', error);
            return res.status(500).json("Error interno del servidor al crear el abono.");
        }
    }

    /**
     * Actualiza el estado y método de cobro de una factura
     *
     * @async
     * @function updateCollectionStatus
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/invoices-issued/123/collection
     * // Body: {
     * //   collection_status: "collected",
     * //   collection_method: "card",
     * //   collection_date: "2025-06-28",
     * //   collection_notes: "Cobrado con tarjeta Visa"
     * // }
     */
    static async updateCollectionStatus(req, res) {
        try {
            const { id } = req.params;
            const { collection_status, collection_method, collection_date, collection_reference, collection_notes } = req.body;

            // Validar ID de factura
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de factura inválido.");
            }

            // Validar que se envíen los datos requeridos
            if (!collection_status || !collection_method) {
                return res.status(400).json("Estado y método de cobro son requeridos.");
            }

            // Preparar datos para actualizar
            const collectionData = {
                collection_status,
                collection_method,
                collection_date: collection_date || null,
                collection_reference: collection_reference || null,
                collection_notes: collection_notes || null
            };

            // Actualizar usando el servicio
            const updated = await InvoicesIssuedService.updateCollectionStatus(Number(id), collectionData);

            if (updated === null) {
                // El servicio devuelve null si el estado o método de cobro es inválido
                return res.status(400).json("Estado o método de cobro inválido para la factura.");
            }

            if (!updated || updated.length === 0) {
                return res.status(500).json("Error al actualizar el estado de cobro: La operación no se completó correctamente.");
            }

            return res.status(200).json({
                message: "Estado de cobro actualizado correctamente",
                invoice: updated
            });

        } catch (error) {
            console.error('Error en updateCollectionStatus:', error);
            return res.status(500).json("Error interno del servidor al actualizar el estado de cobro.");
        }
    }

    /**
     * Obtiene estadísticas generales de facturas emitidas
     *
     * @async
     * @function getInvoiceStats
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/stats
     * // Response: {
     * //   total_invoices: 150,
     * //   pending_invoices: 25,
     * //   total_amount: 45000.50,
     * //   total_iva_repercutido: 9450.11
     * // }
     */
    static async getInvoiceStats(req, res) {
        try {
            const stats = await InvoicesIssuedService.getInvoiceStats();
            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getInvoiceStats:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene estadísticas por cliente
     *
     * @async
     * @function getStatsByClient
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     */
    static async getStatsByClient(req, res) {
        try {
            const stats = await InvoicesIssuedService.getStatsByClient();

            if (!stats || stats.length === 0) {
                return res.status(404).json("No hay estadísticas disponibles");
            }

            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getStatsByClient:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene estadísticas por propietario
     *
     * @async
     * @function getStatsByOwner
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     */
    static async getStatsByOwner(req, res) {
        try {
            const stats = await InvoicesIssuedService.getStatsByOwner();

            if (!stats || stats.length === 0) {
                return res.status(404).json("No hay estadísticas disponibles");
            }

            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getStatsByOwner:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene datos para el libro de IVA repercutido
     *
     * @async
     * @function getVATBookData
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/vat-book/2024?month=7
     * // Response: datos del libro de IVA repercutido
     */
    static async getVATBookData(req, res) {
        try {
            const { year } = req.params;
            const { month } = req.query;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const vatData = await InvoicesIssuedService.getVATBookData(year, month);

            if (!vatData || vatData.length === 0) {
                return res.status(404).json("No hay datos de IVA para el período especificado");
            }

            return res.status(200).json(vatData);
        } catch (error) {
            console.error('Error en getVATBookData:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene balance de ingresos
     *
     * @async
     * @function getIncomeStatement
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/income-statement/2024?month=7
     * // Response: balance de ingresos del período
     */
    static async getIncomeStatement(req, res) {
        try {
            const { year } = req.params;
            const { month } = req.query;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const incomeData = await InvoicesIssuedService.getIncomeStatement(year, month);

            if (!incomeData || incomeData.length === 0) {
                return res.status(404).json("No hay datos de ingresos para el período especificado");
            }

            return res.status(200).json(incomeData);
        } catch (error) {
            console.error('Error en getIncomeStatement:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene resumen mensual de facturación
     *
     * @async
     * @function getMonthlySummary
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/monthly-summary/2024
     * // Response: resumen mensual de facturación del año
     */
    static async getMonthlySummary(req, res) {
        try {
            const { year } = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const monthlyData = await InvoicesIssuedService.getMonthlySummary(year);

            if (!monthlyData || monthlyData.length === 0) {
                return res.status(404).json("No hay datos de facturación para el año especificado");
            }

            return res.status(200).json(monthlyData);
        } catch (error) {
            console.error('Error en getMonthlySummary:', error);
            return res.status(500).json("Error interno del servidor");
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
     * // GET /api/invoices-issued/aging
     * // Response: facturas pendientes con información de antigüedad
     */
    static async getPendingInvoicesAging(req, res) {
        try {
            const agingData = await InvoicesIssuedService.getPendingInvoicesAging();

            if (!agingData || agingData.length === 0) {
                return res.status(404).json("No hay facturas pendientes");
            }

            return res.status(200).json(agingData);
        } catch (error) {
            console.error('Error en getPendingInvoicesAging:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Genera y descarga un PDF de una factura específica
     *
     * @async
     * @function downloadPdf
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/invoices-issued/123/pdf
     * // Response: Archivo PDF para descarga
     */
    static async downloadPdf(req, res) {
        try {
            const invoiceId = req.params.id;

            // Obtener factura con todos los detalles necesarios para el PDF
            const invoice = await InvoicesIssuedService.getInvoiceWithDetails(invoiceId);
            if (!invoice || invoice.length === 0) {
                return res.status(404).json("Factura no encontrada");
            }

            // Crear directorio para PDFs si no existe
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            // Generar nombre de archivo seguro (reemplazar / por -)
            const fileName = `factura_${invoice[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);

            // Generar PDF usando el generador de facturas
            await generateInvoicePdf(invoice[0], filePath);

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err) {
                    return res.status(500).json("Error al generar PDF");
                }
            });
        } catch (error) {
            console.error('Error en downloadPdf:', error);
            return res.status(500).json("Error interno del servidor");
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
     * // GET /api/invoices-issued/refunds/123/pdf
     * // Response: Archivo PDF de abono para descarga
     */
    static async downloadRefundPdf(req, res) {
        try {
            const refundId = req.params.id;

            // Obtener abono con todos los detalles necesarios
            const refund = await InvoicesIssuedService.getRefundWithDetails(refundId);
            if (!refund || refund.length === 0) {
                return res.status(404).json("Abono no encontrado");
            }

            // Crear directorio para PDFs si no existe
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            // Generar nombre de archivo para abono
            const fileName = `abono_${refund[0].invoice_number.replace(/\//g, '-')}.pdf`;
            const filePath = path.join(dir, fileName);

            // Importar generador de PDFs de abono dinámicamente
            const { generateRefundInvoicePdf } = await import('../shared/utils/pdf/refundInvoicePdfGenerator.js'); // CAMBIO: Ruta y nombre de función
            await generateRefundInvoicePdf(refund[0], filePath); // CAMBIO: Nombre de función

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err) {
                    return res.status(500).json("Error al generar PDF");
                }
            });
        } catch (error) {
            console.error('Error en downloadRefundPdf:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // ========================================
    // ENDPOINTS ESPECÍFICOS PARA FACTURACIÓN PROPORCIONAL
    // ========================================

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
     * // GET /api/invoices-issued/123/proportional-details
     * // Response: detalles del cálculo proporcional
     */
    static async getProportionalCalculationDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de factura inválido");
            }

            const details = await InvoicesIssuedService.getProportionalCalculationDetails(Number(id));
            if (!details) {
                return res.status(404).json("Factura no encontrada");
            }

            return res.status(200).json(details);
        } catch (error) {
            console.error('Error en getProportionalCalculationDetails:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Valida un rango de fechas para facturación proporcional
     *
     * @async
     * @function validateProportionalDateRange
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-issued/validate-proportional-dates
     * // Body: { start_date: "2025-07-17", end_date: "2025-07-31" }
     * // Response: validación del rango de fechas
     */
    static async validateProportionalDateRange(req, res) {
        try {
            const { start_date, end_date } = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({
                    isValid: false,
                    message: "Fechas de inicio y fin son requeridas"
                });
            }

            const validation = CalculateHelper.validateDateRange(start_date, end_date);

            if (validation.isValid) {
                // Añadir descripción legible del periodo
                const periodDescription = CalculateHelper.generatePeriodDescription(start_date, end_date);

                return res.status(200).json({
                    ...validation,
                    periodDescription
                });
            } else {
                return res.status(400).json(validation);
            }

        } catch (error) {
            console.error('Error en validateProportionalDateRange:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Calcula una simulación de factura proporcional sin guardarla
     *
     * @async
     * @function simulateProportionalBilling
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/invoices-issued/simulate-proportional
     * // Body: { tax_base: 1000, iva: 21, irpf: 15, start_date: "2025-07-17", end_date: "2025-07-31" }
     * // Response: simulación del cálculo proporcional
     */
    static async simulateProportionalBilling(req, res) {
        try {
            const { tax_base, iva, irpf, start_date, end_date } = req.body;

            // Validaciones básicas
            if (!tax_base || tax_base <= 0) {
                return res.status(400).json("Base imponible debe ser mayor a 0");
            }

            if (!start_date || !end_date) {
                return res.status(400).json("Fechas de inicio y fin son requeridas");
            }

            // Preparar datos para simulación
            const billData = {
                tax_base,
                iva: iva || 0,
                irpf: irpf || 0,
                is_proportional: 1,
                start_date,
                end_date
            };

            // Calcular usando el helper
            const calculation = CalculateHelper.calculateBillTotal(billData);
            const periodDescription = CalculateHelper.generatePeriodDescription(start_date, end_date);

            return res.status(200).json({
                ...calculation,
                periodDescription,
                simulation: true
            });

        } catch (error) {
            console.error('Error en simulateProportionalBilling:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }
}