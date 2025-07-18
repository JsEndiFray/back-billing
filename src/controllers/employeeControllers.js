import EmployeeServices from "../services/employeeServices.js";

export default class EmployeeControllers {

    static async getAllEmployee(req, res) {
        try {
            const employee = await EmployeeServices.getAllEmployees();
            if (!employee.length) {
                return res.status(404).json("No existe ningún empleado registrado.")
            }
            return res.status(200).json(employee);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    };

    static async getEmployee(req, res) {
        try {
            const {name, lastname, identification} = req.query;
            const employee = await EmployeeServices.getEmployee(name, lastname, identification);
            if (!employee.length) {
                return res.status(409).json("Empleado no encontrado");
            }
            return res.status(200).json(employee);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }

    static async getEmployeeById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID Inválido")
            }
            const employee = await EmployeeServices.getEmployeeById(id);
            if (!employee.length) {
                return res.status(409).json("Empleado no encontrado")
            }
            return res.status(200).json(employee);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    };

    static async createEmployee(req, res) {
        try {
            const created = await EmployeeServices.createEmployee(req.body);
            if (!created.length) {
                return res.status(409).json("Error al crear empleado o identificación duplicada")
            }
            return res.status(201).json(created);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    };

    static async updateEmployee(req, res) {
        try {
            const updated = await EmployeeServices.updateEmployee(req.params.id, req.body,);
            if (!updated.length > 0) {
                return res.status(404).json("Empleado no encontrado o no se pudo actualizar")
            }
            return res.status(200).json(updated);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    };

    static async deleteEmployee(req, res) {
        try {
            const deleted = await EmployeeServices.deleteEmployee(req.params.id);
            if (!deleted.length) {
                return res.status(404).json("Empleado no encontrado")
            }
            return res.status(200).json('Empleado eliminado correctamente');

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }


}