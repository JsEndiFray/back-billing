import express from "express";
import ClientsControllers from "../controllers/clientsControllers.js";
import {validateClient} from "../validator/validatorClients.js";
import handleValidationErrors from "../middlewares/validation/handleValidationErrors.js";
import authMiddleware from "../middlewares/auth/authMiddleware.js";
import roleMiddleware from "../middlewares/auth/roleMiddleware.js";

const router = express.Router()

    //Búsquedas → admin y employee
    .get('/type/:clientType', authMiddleware, roleMiddleware(['admin', 'employee']), ClientsControllers.getByClientType)
    .get('/search/company/:company_name', authMiddleware, roleMiddleware(['admin', 'employee']), ClientsControllers.getCompany)
    .get('/search/fullname', authMiddleware, roleMiddleware(['admin', 'employee']), ClientsControllers.getFullName)
    .get('/search/identification/:identification', authMiddleware, roleMiddleware(['admin', 'employee']), ClientsControllers.getByIdentification)

    //Obtener clientes → admin y employee
    .get('/', authMiddleware, roleMiddleware(['admin', 'employee']), ClientsControllers.getAllClients)
    .get('/:id', authMiddleware, roleMiddleware(['admin', 'employee']), ClientsControllers.getById)

    //Crear, actualizar y eliminar → solo admin
    .post('/', authMiddleware, roleMiddleware(['admin']), validateClient, handleValidationErrors, ClientsControllers.createClient)
    .put('/:id', authMiddleware, roleMiddleware(['admin']), validateClient, handleValidationErrors, ClientsControllers.updateClient)
    .delete('/:id', authMiddleware, roleMiddleware(['admin']), ClientsControllers.deleteClient)

export default router;