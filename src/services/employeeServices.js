import EmployeeRepository from "../repository/employeeRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";

/**
 * Servicio de empleado
 */

export default class EmployeeServices {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllEmployee() {
        return await EmployeeRepository.getAll();

    }

    // ========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ========================================


    /**
     * Búsqueda por prioridad secuencial
     * 1. Busca por identificación → devuelve resultado
     * 2. Busca por nombre → si encuentra, devuelve resultado
     * 3. Busca por apellido → si encuentra, devuelve resultado
     *
     * NO es búsqueda combinada (name AND lastname AND identification)
     * ES búsqueda por prioridad (name OR lastname OR identification)
     */

    static async getEmployee(name, lastname, identification) {

        if (!name && !lastname && !identification) return [];

        if (identification) {
            const emp = await EmployeeRepository.findByIdentification(sanitizeString(identification));
            if (emp.length) return emp;
        }
        if (name) {
            const emp = await EmployeeRepository.findByName(sanitizeString(name));
            if (emp.length) return emp;
        }
        if (lastname) {
            const emp = await EmployeeRepository.findByLastname(sanitizeString(lastname));
            if (emp.length) return emp;
        }
        return []
    }

    static async getEmployeeById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await EmployeeRepository.findById(id);
    }

    // ========================================
    // CRUD CON SANITIZACIÓN
    // ========================================

    /**
     * Crear empleado con sanitización y validación de duplicados
     */
    static async createEmployee(data) {
        const dataEmployee = {
            name: data.name?.toUpperCase().trim(),
            lastname: data.lastname?.toUpperCase().trim(),
            email: data.email?.toLowerCase().trim(),
            identification: data.identification?.toUpperCase().trim(),
            phone: data.phone?.trim(),
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
        }
        // Validar identificación única
        const existing = await EmployeeRepository.findByIdentification(dataEmployee.identification);
        if (existing.length > 0) return [];

        const created = await EmployeeRepository.create(dataEmployee);
        if (!created.length) return [];

        return [{id: created[0].id}, dataEmployee]
    }

    /**
     * Actualizar empleado con validación de duplicados
     */
    static async updateEmployee(data, id) {
        if (!id || isNaN(Number(id))) return [];

        const dataEmployee = {
            id: Number(id),
            name: data.name?.toUpperCase().trim(),
            lastname: data.lastname?.toUpperCase().trim(),
            email: data.email?.toLowerCase().trim(),
            identification: data.identification?.toUpperCase().trim(),
            phone: data.phone?.trim(),
            address: data.address?.toUpperCase().trim(),
            postal_code: data.postal_code?.trim(),
            location: data.location?.toUpperCase().trim(),
            province: data.province?.toUpperCase().trim(),
            country: data.country?.toUpperCase().trim(),
        }
        // Verificar que existe
        const existing = await EmployeeRepository.findById(dataEmployee.id);
        if (!existing.length) return [];

        // Validar identificación única (excepto este mismo empleado)
        if (dataEmployee.identification) {
            const employeeWithSameIdentification = await EmployeeRepository.findByIdentification(dataEmployee.identification);
            if (employeeWithSameIdentification.length > 0 && employeeWithSameIdentification[0].id !== Number(id)) {
                return [];
            }
        }

        const updated = await EmployeeRepository.update(dataEmployee)
        if (!updated) return [];

        return [{id: dataEmployee.id}, dataEmployee]

    }

    static async deleteEmployee(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await EmployeeRepository.findById(id);
        if (!existing.length) return [];

        const deleted = await EmployeeRepository.delete(id)
        if (!deleted) return [];

        return existing;
    }

}

