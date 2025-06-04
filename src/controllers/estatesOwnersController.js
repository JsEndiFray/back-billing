import EstateOwnersService from "../services/estatesOwnersServices.js";

export default class EstateOwnersController {

    // Obtener todos
    static async getAllEstateOwners(req, res) {
        try {
            const estateOwners = await EstateOwnersService.getAllEstateOwners();
            if (!estateOwners || estateOwners.length === 0) {
                return res.status(404).json("No se encontraron relaciones inmueble-propietario");
            }
            return res.status(200).json(estateOwners);
        } catch (error) {
            console.error(error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Crear
    static async createEstateOwners(req, res) {
        try {
            const data = req.body;
            const result = await EstateOwnersService.createEstateOwners(data);
            if (!result) {
                return res.status(409).json("Relación inmueble-propietario duplicada");
            }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Actualizar por ID único
    static async updateEstateOwners(req, res) {
        try {
            const { id } = req.params;
            const { ownership_percent } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const result = await EstateOwnersService.updateEstateOwners(id, ownership_percent);
            if (!result) {
                return res.status(400).json("Error al actualizar relación inmueble-propietario");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    // Eliminar por ID único
    static async deleteEstateOwners(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const result = await EstateOwnersService.deleteEstateOwners(id);
            if (!result) {
                return res.status(400).json("Error al eliminar relación inmueble-propietario");
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}