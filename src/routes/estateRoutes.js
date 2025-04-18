import EstateController from "../controllers/estateControllers.js";
import express from "express";

const router = express.Router()

    .get('/', EstateController.getAllEstate)
    .get('/search/cadastral/:cadastral', EstateController.getByCadastralReference)
    .get('/:id', EstateController.getById)


export default router