import express from "express";
import ClientsControllers from "../controllers/clientsControllers.js";
import {validateClient} from "../validator/validatorClient.js";

const router = express.Router()

    .get('/', ClientsControllers.getAllClients)
    .get('/type/:clientType', ClientsControllers.getByClientType)
    .get('/search/company/:company_name', ClientsControllers.getCompany)
    .get('/search/fullname', ClientsControllers.getFullName)
    .get('/search/identification/:identification', ClientsControllers.getByIdentification)
    .get('/:id', ClientsControllers.getById)
    .post('/', validateClient, ClientsControllers.createClient)
    .put('/:id', ClientsControllers.updateClient)
    .delete('/:id', ClientsControllers.deleteClient)


export default router;