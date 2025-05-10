import express from "express";
import OwnersControllers from "../controllers/ownersControllers.js";
import {validateOwners} from "../validator/validatorOwners.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

const router = express.Router()

    //Buscar propietarios admin y employee
    .get('/search/name', auth, role(['admin', 'employee']), OwnersControllers.getOwner)
    .get('/dropdown', auth, role(['admin', 'employee']), OwnersControllers.getAllForDropdownOwners)
    //Obtener propietarios admin y employee
    .get('/', auth, role(['admin', 'employee']), OwnersControllers.getAllOwners)
    .get('/:id', auth, role(['admin', 'employee']), OwnersControllers.getOwnerId)


    //Crear, actualizar y eliminar solo admin
    .post('/', auth, role(['admin']), validateOwners, errorHandler, OwnersControllers.createOwner)
    .put('/:id', auth, role(['admin']), validateOwners, errorHandler, OwnersControllers.updateOwner)
    .delete('/:id', auth, role(['admin']), OwnersControllers.deleteOwner)

export default router;