import BillsControllers from "../controllers/billsControllers.js";
import express from "express";

const router = express.Router()

    .get('/', BillsControllers.getAllBills)
    .get('/search/:bill_number', BillsControllers.getBillNumber)
    .get('/:id', BillsControllers.getBillById)
    .get('/owners/:id', BillsControllers.getOwnersId)
    .get('/clients/:id', BillsControllers.getByClientsId)
    .get('/client/:nif', BillsControllers.getBillsByClientNif)
    .post('/', BillsControllers.createBill)
    .put('/:id', BillsControllers.updateBill)
    .delete('/:id', BillsControllers.deleteBill)

export default router;