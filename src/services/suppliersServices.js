import SuppliersRepository from "../repository/suppliersRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";
import {validate} from "../shared/helpers/nifHelpers.js";

/**
 * Servicio de proveedores
 * Maneja toda la lógica de negocio relacionada con proveedores
 * Actúa como intermediario entre controladores y repository
 */
export default class SuppliersService {

    // ==========================================
    // OBTENER PROVEEDORES (CONSULTAS)
    // ==========================================

    /**
     * Obtiene todos los proveedores activos con formato estandarizado
     */
    static async getAllSuppliers() {
        const suppliers = await SuppliersRepository.getAll();

        return suppliers.map(supplier => ({
            id: supplier.id,
            name: supplier.name,
            company_name: supplier.company_name,
            tax_id: supplier.tax_id,
            address: supplier.address,
            postal_code: supplier.postal_code,
            city: supplier.city,
            province: supplier.province,
            country: supplier.country,
            phone: supplier.phone,
            email: supplier.email,
            contact_person: supplier.contact_person,
            payment_terms: supplier.payment_terms,
            bank_account: supplier.bank_account,
            notes: supplier.notes,
            active: supplier.active,
            created_at: supplier.created_at,
            updated_at: supplier.updated_at
        }));
    }

    /**
     * Obtiene todos los proveedores incluyendo inactivos
     */
    static async getAllSuppliersIncludingInactive() {
        const suppliers = await SuppliersRepository.getAllIncludingInactive();

        return suppliers.map(supplier => ({
            id: supplier.id,
            name: supplier.name,
            company_name: supplier.company_name,
            tax_id: supplier.tax_id,
            display_name: supplier.company_name || supplier.name, // Nombre para mostrar
            payment_terms: supplier.payment_terms,
            active: supplier.active,
            created_at: supplier.created_at,
            updated_at: supplier.updated_at
        }));
    }

    // ==========================================
    // BÚSQUEDAS ESPECÍFICAS CON VALIDACIÓN
    // ==========================================

    /**
     * Busca un proveedor por ID
     */
    static async getSupplierById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await SuppliersRepository.findById(id);
    }

    /**
     * Busca un proveedor por Tax ID (CIF/NIF) con validación
     */
    static async getSupplierByTaxId(taxId) {
        if (!taxId || typeof taxId !== 'string') return [];

        const cleanTaxId = sanitizeString(taxId).toUpperCase();

        // Validar formato de CIF/NIF
        if (!validate(cleanTaxId)) {
            return null; // Formato inválido
        }

        return await SuppliersRepository.findByTaxId(cleanTaxId);
    }

    /**
     * Busca proveedores por nombre (búsqueda parcial)
     */
    static async getSuppliersByName(name) {
        if (!name || typeof name !== 'string' || name.trim().length < 2) return [];

        const cleanName = sanitizeString(name);
        return await SuppliersRepository.findByName(cleanName);
    }

    /**
     * Busca proveedores por términos de pago
     */
    static async getSuppliersByPaymentTerms(paymentTerms) {
        if (!paymentTerms || isNaN(Number(paymentTerms))) return [];
        return await SuppliersRepository.findByPaymentTerms(Number(paymentTerms));
    }

    // ==========================================
    // CREAR NUEVO PROVEEDOR
    // ==========================================

    /**
     * Crea un nuevo proveedor con validaciones completas
     */
    static async createSupplier(data) {
        // Validación de datos obligatorios
        if (!data.name || !data.tax_id) {
            return null; // Faltan datos obligatorios
        }

        // Limpiar y validar Tax ID
        const cleanTaxId = sanitizeString(data.tax_id).toUpperCase();
        if (!validate(cleanTaxId)) {
            return null; // Tax ID inválido
        }

        // Verificar que el Tax ID no esté duplicado
        const existingSupplier = await SuppliersRepository.findByTaxId(cleanTaxId);
        if (existingSupplier.length > 0) {
            return null; // Tax ID duplicado
        }

        // Validar email si se proporciona (ya validado por express-validator)
        // Solo verificamos que llegue limpio

        // Validar términos de pago
        const paymentTerms = Number(data.payment_terms) || 30;
        if (paymentTerms < 0 || paymentTerms > 365) {
            return null; // Términos de pago inválidos
        }

        // Preparar datos limpios
        const supplierData = {
            name: sanitizeString(data.name),
            company_name: data.company_name ? sanitizeString(data.company_name) : null,
            tax_id: cleanTaxId,
            address: data.address ? sanitizeString(data.address) : null,
            postal_code: data.postal_code ? sanitizeString(data.postal_code) : null,
            city: data.city ? sanitizeString(data.city) : null,
            province: data.province ? sanitizeString(data.province) : null,
            country: data.country ? sanitizeString(data.country) : 'España',
            phone: data.phone ? sanitizeString(data.phone) : null,
            email: data.email ? data.email.toLowerCase().trim() : null,
            contact_person: data.contact_person ? sanitizeString(data.contact_person) : null,
            payment_terms: paymentTerms,
            bank_account: data.bank_account ? sanitizeString(data.bank_account) : null,
            notes: data.notes ? sanitizeString(data.notes) : null,
            active: data.active !== undefined ? Boolean(data.active) : true
        };

        const created = await SuppliersRepository.create(supplierData);
        if (!created.length > 0) return [];

        return [{...supplierData, id: created[0].id}];
    }

    // ==========================================
    // ACTUALIZAR PROVEEDOR EXISTENTE
    // ==========================================

    /**
     * Actualiza un proveedor existente con validaciones
     */
    static async updateSupplier(id, updateData) {
        if (!id || isNaN(Number(id))) return [];

        // Verificar que el proveedor existe
        const existing = await SuppliersRepository.findById(id);
        if (!existing || existing.length === 0) return [];

        // Si se actualiza el Tax ID, validar que no esté duplicado
        if (updateData.tax_id) {
            const cleanTaxId = sanitizeString(updateData.tax_id).toUpperCase();
            if (!validate(cleanTaxId)) {
                return null; // Tax ID inválido
            }

            const supplierWithSameTaxId = await SuppliersRepository.findByTaxId(cleanTaxId);
            if (supplierWithSameTaxId.length > 0 && supplierWithSameTaxId[0].id !== Number(id)) {
                return null; // Tax ID duplicado
            }
            updateData.tax_id = cleanTaxId;
        }

        // Validar email si se actualiza (ya validado por express-validator)
        // Solo verificamos que llegue limpio

        // Validar términos de pago si se actualizan
        if (updateData.payment_terms !== undefined) {
            const paymentTerms = Number(updateData.payment_terms);
            if (isNaN(paymentTerms) || paymentTerms < 0 || paymentTerms > 365) {
                return null; // Términos de pago inválidos
            }
            updateData.payment_terms = paymentTerms;
        }

        // Limpiar strings
        const cleanData = {};
        Object.keys(updateData).forEach(key => {
            if (typeof updateData[key] === 'string') {
                cleanData[key] = key === 'email'
                    ? updateData[key].toLowerCase().trim()
                    : sanitizeString(updateData[key]);
            } else {
                cleanData[key] = updateData[key];
            }
        });

        // Combinar datos existentes con actualizaciones
        const supplierData = {
            name: cleanData.name || existing[0].name,
            company_name: cleanData.company_name !== undefined ? cleanData.company_name : existing[0].company_name,
            tax_id: cleanData.tax_id || existing[0].tax_id,
            address: cleanData.address !== undefined ? cleanData.address : existing[0].address,
            postal_code: cleanData.postal_code !== undefined ? cleanData.postal_code : existing[0].postal_code,
            city: cleanData.city !== undefined ? cleanData.city : existing[0].city,
            province: cleanData.province !== undefined ? cleanData.province : existing[0].province,
            country: cleanData.country || existing[0].country,
            phone: cleanData.phone !== undefined ? cleanData.phone : existing[0].phone,
            email: cleanData.email !== undefined ? cleanData.email : existing[0].email,
            contact_person: cleanData.contact_person !== undefined ? cleanData.contact_person : existing[0].contact_person,
            payment_terms: cleanData.payment_terms !== undefined ? cleanData.payment_terms : existing[0].payment_terms,
            bank_account: cleanData.bank_account !== undefined ? cleanData.bank_account : existing[0].bank_account,
            notes: cleanData.notes !== undefined ? cleanData.notes : existing[0].notes,
            active: cleanData.active !== undefined ? Boolean(cleanData.active) : existing[0].active
        };

        const updated = await SuppliersRepository.update(Number(id), supplierData);
        return updated;
    }

    // ==========================================
    // ELIMINAR PROVEEDOR
    // ==========================================

    /**
     * Elimina un proveedor (borrado lógico)
     */
    static async deleteSupplier(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await SuppliersRepository.findById(id);
        if (!existing.length > 0) return [];

        // TODO: Verificar que no tenga facturas recibidas asociadas
        // Esto se implementará cuando tengamos invoices_received

        const result = await SuppliersRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }

    /**
     * Reactiva un proveedor inactivo
     */
    static async activateSupplier(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await SuppliersRepository.findById(id);
        if (!existing.length > 0) return [];

        const result = await SuppliersRepository.activate(id);
        return result.length > 0 ? [{activated: true, id: Number(id)}] : [];
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD Y ESTADÍSTICAS
    // ==========================================

    /**
     * Obtiene estadísticas de proveedores
     */
    static async getSupplierStats() {
        const stats = await SuppliersRepository.getStats();
        return {
            total_suppliers: stats.total_suppliers || 0,
            active_suppliers: stats.active_suppliers || 0,
            inactive_suppliers: stats.inactive_suppliers || 0,
            percentage_active: stats.total_suppliers > 0
                ? Math.round((stats.active_suppliers / stats.total_suppliers) * 100)
                : 0
        };
    }

    /**
     * Genera sugerencias de proveedores para autocompletado
     */
    static async getSupplierSuggestions(query) {
        if (!query || query.length < 2) return [];

        const suppliers = await this.getSuppliersByName(query);
        return suppliers.map(supplier => ({
            id: supplier.id,
            label: supplier.company_name || supplier.name,
            tax_id: supplier.tax_id,
            payment_terms: supplier.payment_terms
        }));
    }

    // ==========================================
    // MÉTODOS DE VALIDACIÓN PRIVADOS
    // ==========================================

    /**
     * Valida que los términos de pago sean razonables
     */
    static isValidPaymentTerms(terms) {
        const validTerms = [0, 15, 30, 45, 60, 90, 120];
        return validTerms.includes(Number(terms));
    }

    /**
     * Formatea el nombre completo del proveedor para mostrar
     */
    static formatSupplierDisplayName(supplier) {
        if (supplier.company_name) {
            return `${supplier.company_name} (${supplier.name})`;
        }
        return supplier.name;
    }
}