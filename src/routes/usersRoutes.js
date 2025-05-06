import express from "express";
import UsersController from "../controllers/usersController.js";
import authMiddleware from "../middlewares/auth/authMiddleware.js";
import roleMiddleware from "../middlewares/auth/roleMiddleware.js";
import {validateUser} from "../validator/validatorUsers.js";
import handleValidationErrors from '../middlewares/validation/handleValidationErrors.js';

const router = express.Router()

    //Buscar usuario → admin
    .get('/search/username/:username', authMiddleware, roleMiddleware(['admin']), UsersController.getUsername)
    .get('/search/email/:email', authMiddleware, roleMiddleware(['admin']), UsersController.getEmail)
    .get('/search/phone/:phone', authMiddleware, roleMiddleware(['admin']), UsersController.getPhone)

    //Ver usuarios → admin y employee
    .get('/', authMiddleware, roleMiddleware(['admin', 'employee']), UsersController.getAllUsers)
    .get('/:id', authMiddleware, roleMiddleware(['admin', 'employee']), UsersController.getUserId)

    //Crear, actualizar y eliminar usuarios → solo admin
    .post('/', authMiddleware, roleMiddleware(['admin']), ...validateUser, handleValidationErrors, UsersController.createUser)
    .put('/:id', authMiddleware, roleMiddleware(['admin']), ...validateUser, handleValidationErrors, UsersController.updateUser)
    .delete('/:id', authMiddleware, roleMiddleware(['admin']), UsersController.deleteUser)

export default router;