import express from "express";
import EstateOwnersController from "../controllers/estatesOwnersController.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

const router = express.Router()
    // Ver estate owners
    .get("/", auth, role(['employee']), EstateOwnersController.getAllEstateOwners)

    // Crear
    .post("/", auth, role(['admin']), EstateOwnersController.createEstateOwners)

    // Actualizar por ID ÚNICO
    .put("/:id", auth, role(['admin']), EstateOwnersController.updateEstateOwners)

    // Eliminar por ID ÚNICO
    .delete("/:id", auth, role(['admin']), EstateOwnersController.deleteEstateOwners)

export default router;