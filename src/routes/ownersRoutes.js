import OwnersControllers from "../controllers/ownersControllers.js";
import express from "express";
import {validateCreateClient} from "../validator/validatorOwners.js"

const router = express.Router()

    .get('/', OwnersControllers.getAllOwners)


    .post('/', validateCreateClient, OwnersControllers.createOwner)


export default router;