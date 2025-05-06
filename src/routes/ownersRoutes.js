import express from "express";
import OwnersControllers from "../controllers/ownersControllers.js";
import {validateOwners} from "../validator/validatorOwners.js";
import handleValidationErrors from "../middlewares/validation/handleValidationErrors.js";
import authMiddleware from "../middlewares/auth/authMiddleware.js";
import roleMiddleware from "../middlewares/auth/roleMiddleware.js";

const router = express.Router()

    //Buscar propietarios admin y employee
    .get('/search/name', authMiddleware, roleMiddleware(['admin', 'employee']), OwnersControllers.getOwner)

    //Obtener propietarios admin y employee
    .get('/', authMiddleware, roleMiddleware(['admin', 'employee']), OwnersControllers.getAllOwners)
    .get('/:id', authMiddleware, roleMiddleware(['admin', 'employee']), OwnersControllers.getOwnerId)

    //Crear, actualizar y eliminar solo admin
    .post('/', authMiddleware, roleMiddleware(['admin']), validateOwners, handleValidationErrors, OwnersControllers.createOwner)
    .put('/:id', authMiddleware, roleMiddleware(['admin']), validateOwners, handleValidationErrors, OwnersControllers.updateOwner)
    .delete('/:id', authMiddleware, roleMiddleware(['admin']), OwnersControllers.deleteOwner)

export default router;