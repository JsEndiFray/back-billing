import express from "express";
import EstateController from "../controllers/estatesControllers.js";
import {validateEstate} from "../validator/validatorEstates.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

const router = express.Router()

    //Buscar inmuebles admin y employee
    .get('/search/cadastral/:cadastral', auth, role(['admin', 'employee']), EstateController.getByCadastralReference)
    .get('/dropdown/list', auth, role(['admin', 'employee']), EstateController.getAllForDropdownEstates)

    //Obtener inmuebles admin y employee
    .get('/', auth, role(['admin', 'employee']), EstateController.getAllEstate)
    .get('/:id', auth, role(['admin', 'employee']), EstateController.getById)

    //Crear, actualizar y eliminar solo admin
    .post('/', auth, role(['admin', 'employee']), validateEstate, errorHandler, EstateController.createEstate)
    .put('/:id', auth, role(['admin']), validateEstate, errorHandler, EstateController.updateEstate)
    .delete('/:id', auth, role(['admin']), EstateController.deleteEstate)

export default router;