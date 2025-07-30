import SuppliersService from '../services/suppliersServices.js';
import {validationResult} from 'express-validator';

/**
 * Controlador para la gestión de proveedores
 * Maneja todas las operaciones HTTP relacionadas con proveedores
 * para el sistema de facturas recibidas
 */
export default class SuppliersController {

    /**
     * Obtiene todos los proveedores activos
     *
     * @async
     * @function getAllSuppliers
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers
     * // Response: [{ id: 1, name: "Proveedor A", tax_id: "B12345678", ... }]
     */
    static async getAllSuppliers(req, res) {
        try {
            const suppliers = await SuppliersService.getAllSuppliers();

            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json("No se encontraron proveedores");
            }

            return res.status(200).json(suppliers);
        } catch (error) {
            console.error('Error en getAllSuppliers:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene todos los proveedores incluyendo inactivos
     *
     * @async
     * @function getAllSuppliersIncludingInactive
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/all
     * // Response: [{ id: 1, name: "Proveedor A", active: true, ... }]
     */
    static async getAllSuppliersIncludingInactive(req, res) {
        try {
            const suppliers = await SuppliersService.getAllSuppliersIncludingInactive();

            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json("No se encontraron proveedores");
            }

            return res.status(200).json(suppliers);
        } catch (error) {
            console.error('Error en getAllSuppliersIncludingInactive:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene un proveedor específico por su ID
     *
     * @async
     * @function getSupplierById
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/123
     * // Response: { id: 123, name: "Proveedor A", tax_id: "B12345678", ... }
     */
    static async getSupplierById(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const supplier = await SuppliersService.getSupplierById(id);

            if (!supplier || supplier.length === 0) {
                return res.status(404).json("Proveedor no encontrado");
            }

            return res.status(200).json(supplier[0]);
        } catch (error) {
            console.error('Error en getSupplierById:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca un proveedor por su Tax ID (CIF/NIF)
     *
     * @async
     * @function getSupplierByTaxId
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/tax/B12345678
     * // Response: { id: 1, name: "Empresa ABC", tax_id: "B12345678", ... }
     */
    static async getSupplierByTaxId(req, res) {
        try {
            const {tax_id} = req.params;

            if (!tax_id || tax_id.trim().length === 0) {
                return res.status(400).json("CIF/NIF requerido");
            }

            const supplier = await SuppliersService.getSupplierByTaxId(tax_id);

            if (supplier === null) {
                return res.status(400).json("Formato de CIF/NIF inválido");
            }

            if (!supplier || supplier.length === 0) {
                return res.status(404).json("Proveedor no encontrado con ese CIF/NIF");
            }

            return res.status(200).json(supplier[0]);
        } catch (error) {
            console.error('Error en getSupplierByTaxId:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca proveedores por nombre (búsqueda parcial)
     *
     * @async
     * @function getSuppliersByName
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/search/electricidad
     * // Response: [{ id: 1, name: "Iberdrola", ... }, { id: 2, name: "Endesa", ... }]
     */
    static async getSuppliersByName(req, res) {
        try {
            const {name} = req.params;

            if (!name || name.trim().length < 2) {
                return res.status(400).json("El nombre debe tener al menos 2 caracteres");
            }

            const suppliers = await SuppliersService.getSuppliersByName(name);

            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json("No se encontraron proveedores con ese nombre");
            }

            return res.status(200).json(suppliers);
        } catch (error) {
            console.error('Error en getSuppliersByName:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Crea un nuevo proveedor
     *
     * @async
     * @function createSupplier
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/suppliers
     * // Body: {
     * //   name: "Juan Pérez",
     * //   tax_id: "12345678Z",
     * //   email: "juan@email.com",
     * //   payment_terms: 30
     * // }
     * // Response: { id: 123, name: "Juan Pérez", tax_id: "12345678Z", ... }
     */
    static async createSupplier(req, res) {
        try {
            const data = req.body;
            const created = await SuppliersService.createSupplier(data);

            if (created === null) {
                return res.status(400).json("Error en los datos proporcionados o CIF/NIF duplicado");
            }

            if (!created || created.length === 0) {
                return res.status(400).json("Error al crear proveedor");
            }

            return res.status(201).json({
                message: "Proveedor creado correctamente",
                supplier: created[0]
            });
        } catch (error) {
            console.error('Error en createSupplier:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Actualiza un proveedor existente
     *
     * @async
     * @function updateSupplier
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/suppliers/123
     * // Body: { name: "Juan Pérez García", payment_terms: 45 }
     * // Response: { message: "Proveedor actualizado", supplier: {...} }
     */
    static async updateSupplier(req, res) {
        try {
            const {id} = req.params;
            const updateData = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de proveedor inválido");
            }

            // Verificar que el proveedor existe
            const existing = await SuppliersService.getSupplierById(id);
            if (!existing || existing.length === 0) {
                return res.status(404).json("Proveedor no encontrado");
            }

            const updated = await SuppliersService.updateSupplier(Number(id), updateData);

            if (updated === null) {
                return res.status(400).json("Error en los datos proporcionados o CIF/NIF duplicado");
            }

            if (!updated || updated.length === 0) {
                return res.status(400).json("Error al actualizar proveedor");
            }

            return res.status(200).json({
                message: "Proveedor actualizado correctamente",
                supplier: updated[0]
            });
        } catch (error) {
            console.error('Error en updateSupplier:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Elimina un proveedor (borrado lógico)
     *
     * @async
     * @function deleteSupplier
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // DELETE /api/suppliers/123
     * // Response: 204 No Content
     */
    static async deleteSupplier(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de proveedor inválido");
            }

            const deleted = await SuppliersService.deleteSupplier(id);

            if (!deleted || deleted.length === 0) {
                return res.status(400).json("Error al eliminar proveedor o proveedor no encontrado");
            }

            return res.status(204).send();
        } catch (error) {
            console.error('Error en deleteSupplier:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Reactiva un proveedor inactivo
     *
     * @async
     * @function activateSupplier
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/suppliers/123/activate
     * // Response: { message: "Proveedor reactivado correctamente" }
     */
    static async activateSupplier(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de proveedor inválido");
            }

            const activated = await SuppliersService.activateSupplier(id);

            if (!activated || activated.length === 0) {
                return res.status(400).json("Error al reactivar proveedor o proveedor no encontrado");
            }

            return res.status(200).json({
                message: "Proveedor reactivado correctamente"
            });
        } catch (error) {
            console.error('Error en activateSupplier:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene estadísticas de proveedores
     *
     * @async
     * @function getSupplierStats
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/stats
     * // Response: {
     * //   total_suppliers: 25,
     * //   active_suppliers: 20,
     * //   inactive_suppliers: 5,
     * //   percentage_active: 80
     * // }
     */
    static async getSupplierStats(req, res) {
        try {
            const stats = await SuppliersService.getSupplierStats();
            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getSupplierStats:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Obtiene sugerencias de proveedores para autocompletado
     *
     * @async
     * @function getSupplierSuggestions
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/suggestions?q=iber
     * // Response: [
     * //   { id: 1, label: "Iberdrola", tax_id: "A12345678", payment_terms: 30 },
     * //   { id: 2, label: "Ibercaja", tax_id: "B87654321", payment_terms: 60 }
     * // ]
     */
    static async getSupplierSuggestions(req, res) {
        try {
            const {q} = req.query;

            if (!q || q.length < 2) {
                return res.status(400).json("Query debe tener al menos 2 caracteres");
            }

            const suggestions = await SuppliersService.getSupplierSuggestions(q);
            return res.status(200).json(suggestions);
        } catch (error) {
            console.error('Error en getSupplierSuggestions:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca proveedores por términos de pago
     *
     * @async
     * @function getSuppliersByPaymentTerms
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/suppliers/payment-terms/30
     * // Response: [{ id: 1, name: "Proveedor A", payment_terms: 30, ... }]
     */
    static async getSuppliersByPaymentTerms(req, res) {
        try {
            const {payment_terms} = req.params;

            if (!payment_terms || isNaN(Number(payment_terms))) {
                return res.status(400).json("Términos de pago inválidos");
            }

            const suppliers = await SuppliersService.getSuppliersByPaymentTerms(payment_terms);

            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json("No se encontraron proveedores con esos términos de pago");
            }

            return res.status(200).json(suppliers);
        } catch (error) {
            console.error('Error en getSuppliersByPaymentTerms:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }
}