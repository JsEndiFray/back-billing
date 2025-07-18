import EstateOwnersService from "../services/estatesOwnersServices.js";

/**
 * Controlador para relaciones propiedad-propietario
 * El más simple: CRUD básico sin búsquedas complejas
 */
export default class EstateOwnersController {

    /**
     * Obtiene todas las relaciones con JOINs
     * Incluye nombres de propiedades y propietarios
     */
    static async getAllEstateOwners(req, res) {
        try {
            const estateOwners = await EstateOwnersService.getAllEstateOwners();
            if (!estateOwners.length) {
                return res.status(404).json("No se encontraron relaciones inmueble-propietario");
            }
            return res.status(200).json(estateOwners);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Busca relación propiedad-propietario por ID
     */
    static async getEstateOwnersById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id)) || Number(id) <= 0) {
                return res.status(400).json("ID inválido");
            }
            const result = await EstateOwnersService.getEstateOwnerById(Number(id));
            if (!result.length) {
                return res.status(404).json("Inmueble y propietario no encontrado");
            }
            return res.status(200).json(result);

        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Crear relación propiedad-propietario
     * El servicio maneja duplicados automáticamente
     */
    static async createEstateOwners(req, res) {
        try {
            const data = req.body;
            const result = await EstateOwnersService.createEstateOwners(data);
            if (!result.length) {
                return res.status(409).json("Relación inmueble-propietario duplicada");
            }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Actualizar porcentaje de propiedad por ID único
     */
    static async updateEstateOwners(req, res) {
        try {
            const {id} = req.params;
            const {ownership_percentage} = req.body;

            // Validar ID
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            // Validar ownership_percentage
            if (ownership_percentage === undefined || ownership_percentage === null) {
                return res.status(400).json("Porcentaje de propiedad es requerido");
            }
            if (typeof ownership_percentage !== 'number' || ownership_percentage < 0 || ownership_percentage > 100) {
                return res.status(400).json("Porcentaje de propiedad inválido (debe ser entre 0 y 100)");
            }

            const result = await EstateOwnersService.updateEstateOwner(Number(id), ownership_percentage);

            if (!result.length) {
                return res.status(400).json("Error al actualizar relación inmueble-propietario");
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * Eliminar relación por ID único
     */
    static async deleteEstateOwners(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID inválido");
            }

            const result = await EstateOwnersService.deleteEstateOwners(id);
            if (!result.length) {
                return res.status(400).json("Error al eliminar relación inmueble-propietario");
            }
            return res.status(204).send(); // No content - eliminación exitosa
        } catch (error) {
            return res.status(500).json("Error interno del servidor");
        }
    }
}

/**
 *CARACTERÍSTICAS FINALES:
 * - Controlador más simple: solo CRUD básico
 * - Sin búsquedas complejas o filtros
 * - Sin validaciones duplicadas (el servicio las maneja)
 * - Verificaciones consistentes con array.length
 * - Manejo estándar de códigos HTTP
 * - Enfocado en tabla de relaciones pura
 * - Consistencia total con patrón de otros controladores
 */