import express from "express";
import EstateOwnersController from "../controllers/estatesOwnersController.js";

const router = express.Router()

    .get("/", EstateOwnersController.getAllEstateOwners)
    .post("/", EstateOwnersController.createEstateOwners)
    .put("/:estate_id/:owners_id", EstateOwnersController.updateEstateOwners)
    .delete("/:estate_id/:owners_id", EstateOwnersController.deleteEstateOwners)
export default router;