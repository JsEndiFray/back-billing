import EmployeeRepository from "../repository/employeeRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";

/**
 * Servicio de empleado
 */

export default class EmployeeServices {

    // ========================================
    // MÉTODOS DE CONSULTA
    // ========================================

    static async getAllEmployees() {
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
            if (emp.length > 0) return emp;
        }
        if (name) {
            const emp = await EmployeeRepository.findByName(sanitizeString(name));
            if (emp.length > 0) return emp;
        }
        if (lastname) {
            const emp = await EmployeeRepository.findByLastname(sanitizeString(lastname));
            if (emp.length > 0) return emp;
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
        const employeeData = {
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
        const existing = await EmployeeRepository.findByIdentification(employeeData.identification);
        if (existing.length > 0) return [];

        const created = await EmployeeRepository.create(employeeData);
        if (!created.length) return [];

        return [{...employeeData, id: created[0].id}]
    }

    /**
     * Actualizar empleado con validación de duplicados
     */
    static async updateEmployee(id, data) {
        if (!id || isNaN(Number(id))) return [];

        const cleanEmployeeData = {
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
        const existing = await EmployeeRepository.findById(cleanEmployeeData.id);
        if (!existing.length > 0) return [];

        // Validar identificación única (excepto este mismo empleado)
        if (cleanEmployeeData.identification) {
            const employeeWithSameIdentification = await EmployeeRepository.findByIdentification(cleanEmployeeData.identification);
            if (employeeWithSameIdentification.length > 0 && employeeWithSameIdentification[0].id !== Number(id)) {
                return [];
            }
        }

        const updated = await EmployeeRepository.update(cleanEmployeeData)
        if (!updated.length > 0) return [];

        return [cleanEmployeeData];

    }

    static async deleteEmployee(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await EmployeeRepository.findById(id);
        if (!existing.length > 0) return [];

        const deleted = await EmployeeRepository.delete(id)
        if (!deleted.length > 0) return [];

        return [{deleted: true, id: Number(id)}];
    }

}

