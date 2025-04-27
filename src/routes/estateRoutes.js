import EstateController from "../controllers/estateControllers.js";
import express from "express";
import {validateEstate} from "../validator/validatorEstate.js";

const router = express.Router()

    .get('/', EstateController.getAllEstate)
    .get('/search/cadastral/:cadastral', EstateController.getByCadastralReference)
    .get('/:id', EstateController.getById)
    .post('/', validateEstate, EstateController.createEstate)
    .put('/:id', validateEstate, EstateController.updateEstate)
    .delete('/:id', EstateController.deleteEstate)

export default router