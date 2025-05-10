import express from "express";
import ClientsControllers from "../controllers/clientsControllers.js";
import {validateClient} from "../validator/validatorClients.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

const router = express.Router()

    //Búsquedas admin y employee
    .get('/type/:clientType', auth, role(['admin', 'employee']), ClientsControllers.getByClientType)
    .get('/search/company/:company_name', auth, role(['admin', 'employee']), ClientsControllers.getCompany)
    .get('/search/fullname', auth, role(['admin', 'employee']), ClientsControllers.getFullName)
    .get('/search/identification/:identification', auth, role(['admin', 'employee']), ClientsControllers.getByIdentification)
    .get('/dropdown', auth, role(['admin', 'employee']), ClientsControllers.getAllForDropdownClients)

    //Obtener clientes admin y employee
    .get('/', auth, role(['admin', 'employee']), ClientsControllers.getAllClients)
    .get('/:id', auth, role(['admin', 'employee']), ClientsControllers.getById)

    //Crear, actualizar y eliminar solo admin
    .post('/', auth, role(['admin','employee']), validateClient, errorHandler, ClientsControllers.createClient)
    .put('/:id', auth, role(['admin']), validateClient, errorHandler, ClientsControllers.updateClient)
    .delete('/:id', auth, role(['admin']), ClientsControllers.deleteClient)

export default router;