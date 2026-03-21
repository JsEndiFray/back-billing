import EmployeeServices from "../services/employeeServices.js";
import { createEmployeeDTO, updateEmployeeDTO } from "../dto/employee.dto.js";

export default class EmployeeControllers {

    static async getAllEmployee(req, res, next) {
        try {
            const employee = await EmployeeServices.getAllEmployees();
            if (!employee.length) {
                return res.status(404).json({ success: false, message: "No existe ningún empleado registrado." });
            }
            return res.status(200).json({ success: true, data: employee });
        } catch (error) {
            next(error);
        }
    }

    static async getEmployee(req, res, next) {
        try {
            const { name, lastname, identification } = req.query;
            const employee = await EmployeeServices.getEmployee(name, lastname, identification);
            if (!employee.length) {
                return res.status(404).json({ success: false, message: "Empleado no encontrado" });
            }
            return res.status(200).json({ success: true, data: employee });
        } catch (error) {
            next(error);
        }
    }

    static async getEmployeeById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }
            const employee = await EmployeeServices.getEmployeeById(id);
            if (!employee.length) {
                return res.status(404).json({ success: false, message: "Empleado no encontrado" });
            }
            return res.status(200).json({ success: true, data: employee });
        } catch (error) {
            next(error);
        }
    }

    static async createEmployee(req, res, next) {
        try {
            const dto = createEmployeeDTO(req.body);
            const created = await EmployeeServices.createEmployee(dto);
            if (!created.length) {
                return res.status(409).json({ success: false, message: "Error al crear empleado o identificación duplicada" });
            }
            return res.status(201).json({ success: true, data: created });
        } catch (error) {
            next(error);
        }
    }

    static async updateEmployee(req, res, next) {
        try {
            const dto = updateEmployeeDTO(req.body);
            const updated = await EmployeeServices.updateEmployee(req.params.id, dto);
            if (!updated || updated.length === 0) {
                return res.status(404).json({ success: false, message: "Empleado no encontrado o no se pudo actualizar" });
            }
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    static async deleteEmployee(req, res, next) {
        try {
            const deleted = await EmployeeServices.deleteEmployee(req.params.id);
            if (!deleted.length) {
                return res.status(404).json({ success: false, message: "Empleado no encontrado" });
            }
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
