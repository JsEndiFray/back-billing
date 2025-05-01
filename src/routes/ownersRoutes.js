import OwnersControllers from "../controllers/ownersControllers.js";
import express from "express";
import {validateOwners} from "../validator/validatorOwners.js"

const router = express.Router()

    .get('/', OwnersControllers.getAllOwners)
    .get('/search', OwnersControllers.getOwner)
    .get('/:id', OwnersControllers.getOwnerId)
    .post('/', validateOwners, OwnersControllers.createOwner)
    .put('/:id', validateOwners, OwnersControllers.updateOwner)
    .delete('/:id', OwnersControllers.deleteOwner)

export default router;