import express from "express";
import UsersController from "../controllers/usersController.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import {validateUser} from "../validator/validatorUsers.js";
import errorHandler from '../middlewares/errorHandler.js';

const router = express.Router()

    //Buscar usuario admin
    .get('/search/username/:username', auth, role(['admin']), UsersController.getUsername)
    .get('/search/email/:email', auth, role(['admin']), UsersController.getEmail)
    .get('/search/phone/:phone', auth, role(['admin']), UsersController.getPhone)

    //Ver usuarios admin y employee
    .get('/', auth, role(['admin', 'employee']), UsersController.getAllUsers)
    .get('/:id', auth, role(['admin', 'employee']), UsersController.getUserId)

    //Crear, actualizar y eliminar usuarios solo admin
    .post('/', auth, role(['admin']), ...validateUser, errorHandler, UsersController.createUser)
    .put('/:id', auth, role(['admin']), ...validateUser, errorHandler, UsersController.updateUser)
    .delete('/:id', auth, role(['admin']), UsersController.deleteUser)

export default router;