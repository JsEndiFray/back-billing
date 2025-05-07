import express from "express";
import EstateOwnersController from "../controllers/estatesOwnersController.js";
import authMiddleware from "../middlewares/auth/authMiddleware.js";
import roleMiddleware from "../middlewares/auth/roleMiddleware.js";

const router = express.Router()
    // Ver estate owners
    .get("/", authMiddleware, roleMiddleware(['employee']), EstateOwnersController.getAllEstateOwners)

    // Crear, actualizar y eliminar estate owners
    .post("/", authMiddleware, roleMiddleware(['admin']), EstateOwnersController.createEstateOwners)
    .put("/:estate_id/:owners_id", authMiddleware, roleMiddleware(['admin']), EstateOwnersController.updateEstateOwners)
    .delete("/:estate_id/:owners_id", authMiddleware, roleMiddleware(['admin']), EstateOwnersController.deleteEstateOwners)
export default router;