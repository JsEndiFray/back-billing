import express from "express";
import EstateController from "../controllers/estatesControllers.js";
import {validateEstate} from "../validator/validatorEstates.js";
import handleValidationErrors from "../middlewares/validation/handleValidationErrors.js";
import authMiddleware from "../middlewares/auth/authMiddleware.js";
import roleMiddleware from "../middlewares/auth/roleMiddleware.js";

const router = express.Router()

    //Buscar inmuebles → admin y employee
    .get('/search/cadastral/:cadastral', authMiddleware, roleMiddleware(['admin', 'employee']), EstateController.getByCadastralReference)

    //Obtener inmuebles → admin y employee
    .get('/', authMiddleware, roleMiddleware(['admin', 'employee']), EstateController.getAllEstate)
    .get('/:id', authMiddleware, roleMiddleware(['admin', 'employee']), EstateController.getById)

    //Crear, actualizar y eliminar → solo admin
    .post('/', authMiddleware, roleMiddleware(['admin']), validateEstate, handleValidationErrors, EstateController.createEstate)
    .put('/:id', authMiddleware, roleMiddleware(['admin']), validateEstate, handleValidationErrors, EstateController.updateEstate)
    .delete('/:id', authMiddleware, roleMiddleware(['admin']), EstateController.deleteEstate)

export default router;