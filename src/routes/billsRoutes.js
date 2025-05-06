import express from "express";
import BillsControllers from "../controllers/billsControllers.js";
import authMiddleware from "../middlewares/auth/authMiddleware.js";
import roleMiddleware from "../middlewares/auth/roleMiddleware.js";

const router = express.Router()

    //Búsquedas  admin y employee
    .get('/search/:bill_number', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.getBillNumber)
    .get('/owners/:id', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.getOwnersId)
    .get('/clients/:id', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.getByClientsId)
    .get('/clients/nif/:nif', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.getBillsByClientNif)

    //Obtener facturas  admin y employee
    .get('/', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.getAllBills)
    .get('/:id', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.getBillById)

    //Crear facturas admin y employee
    .post('/', authMiddleware, roleMiddleware(['admin', 'employee']), BillsControllers.createBill)

    //Actualizar y eliminar facturas solo admin
    .put('/:id', authMiddleware, roleMiddleware(['admin']), BillsControllers.updateBill)
    .delete('/:id', authMiddleware, roleMiddleware(['admin']), BillsControllers.deleteBill)

export default router;