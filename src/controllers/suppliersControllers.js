import SuppliersService from '../services/suppliersServices.js';
import { createSupplierDTO, updateSupplierDTO } from '../dto/supplier.dto.js';

export default class SuppliersController {

    static async getAllSuppliers(req, res, next) {
        try {
            const suppliers = await SuppliersService.getAllSuppliers();
            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron proveedores" });
            }
            return res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            next(error);
        }
    }

    static async getAllSuppliersIncludingInactive(req, res, next) {
        try {
            const suppliers = await SuppliersService.getAllSuppliersIncludingInactive();
            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron proveedores" });
            }
            return res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            next(error);
        }
    }

    static async getSupplierById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const supplier = await SuppliersService.getSupplierById(id);
            if (!supplier || supplier.length === 0) {
                return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
            }
            return res.status(200).json({ success: true, data: supplier[0] });
        } catch (error) {
            next(error);
        }
    }

    static async getSupplierByTaxId(req, res, next) {
        try {
            const { tax_id } = req.params;
            if (!tax_id || tax_id.trim().length === 0) {
                return res.status(400).json({ success: false, message: "CIF/NIF requerido" });
            }
            const supplier = await SuppliersService.getSupplierByTaxId(tax_id);
            if (!supplier || supplier.length === 0) {
                return res.status(404).json({ success: false, message: "Proveedor no encontrado con ese CIF/NIF" });
            }
            return res.status(200).json({ success: true, data: supplier[0] });
        } catch (error) {
            next(error);
        }
    }

    static async getSuppliersByName(req, res, next) {
        try {
            const { name } = req.params;
            if (!name || name.trim().length < 2) {
                return res.status(400).json({ success: false, message: "El nombre debe tener al menos 2 caracteres" });
            }
            const suppliers = await SuppliersService.getSuppliersByName(name);
            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron proveedores con ese nombre" });
            }
            return res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            next(error);
        }
    }

    static async createSupplier(req, res, next) {
        try {
            const dto = createSupplierDTO(req.body);
            const created = await SuppliersService.createSupplier(dto);
            if (!created || created.length === 0) {
                return res.status(400).json({ success: false, message: "Error al crear proveedor" });
            }
            return res.status(201).json({ success: true, data: created[0] });
        } catch (error) {
            next(error);
        }
    }

    static async updateSupplier(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de proveedor inválido" });
            }
            const dto = updateSupplierDTO(req.body);
            const updated = await SuppliersService.updateSupplier(Number(id), dto);
            if (!updated || updated.length === 0) {
                return res.status(400).json({ success: false, message: "Error al actualizar proveedor" });
            }
            return res.status(200).json({ success: true, data: updated[0] });
        } catch (error) {
            next(error);
        }
    }

    static async deleteSupplier(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de proveedor inválido" });
            }
            const deleted = await SuppliersService.deleteSupplier(id);
            if (!deleted || deleted.length === 0) {
                return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async activateSupplier(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de proveedor inválido" });
            }
            const activated = await SuppliersService.activateSupplier(id);
            if (!activated || activated.length === 0) {
                return res.status(400).json({ success: false, message: "Error al reactivar proveedor o proveedor no encontrado" });
            }
            return res.status(200).json({ success: true, data: activated[0] });
        } catch (error) {
            next(error);
        }
    }

    static async getSupplierStats(req, res, next) {
        try {
            const stats = await SuppliersService.getSupplierStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getSupplierSuggestions(req, res, next) {
        try {
            const { q } = req.query;
            if (!q || q.length < 2) {
                return res.status(400).json({ success: false, message: "Query debe tener al menos 2 caracteres" });
            }
            const suggestions = await SuppliersService.getSupplierSuggestions(q);
            return res.status(200).json({ success: true, data: suggestions });
        } catch (error) {
            next(error);
        }
    }

    static async getSuppliersByPaymentTerms(req, res, next) {
        try {
            const { payment_terms } = req.params;
            if (!payment_terms || isNaN(Number(payment_terms))) {
                return res.status(400).json({ success: false, message: "Términos de pago inválidos" });
            }
            const suppliers = await SuppliersService.getSuppliersByPaymentTerms(payment_terms);
            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron proveedores con esos términos de pago" });
            }
            return res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            next(error);
        }
    }
}
