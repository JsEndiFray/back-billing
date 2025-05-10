import express from "express";
import BillsControllers from "../controllers/billsControllers.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

const router = express.Router()

    // === RUTAS PARA ABONOS (REFUNDS) ===
    // Estas rutas deben ir primero para evitar conflictos con rutas como /:id
    .get('/refunds', auth, role(['admin', 'employee']), BillsControllers.getAllRefunds)
    .post('/refunds', auth, role(['admin']), BillsControllers.createRefund)
    .get('/refunds/:id/pdf', auth, role(['admin', 'employee']), BillsControllers.downloadRefundPdf)

    // === RUTAS PARA BÚSQUEDAS (FACTURAS NORMALES) ===
    .get('/search/:bill_number', auth, role(['admin', 'employee']), BillsControllers.getBillNumber)
    .get('/owners/:id', auth, role(['admin', 'employee']), BillsControllers.getOwnersId)
    .get('/clients/nif/:nif', auth, role(['admin', 'employee']), BillsControllers.getBillsByClientNif)
    .get('/clients/:id', auth, role(['admin', 'employee']), BillsControllers.getByClientsId)
    .get('/', auth, role(['admin', 'employee']), BillsControllers.getAllBills)

    // === RUTAS PARA GESTIÓN DE FACTURAS NORMALES ===
    .get('/:id/pdf', auth, role(['admin', 'employee']), BillsControllers.downloadPdf)
    .get('/:id', auth, role(['admin', 'employee']), BillsControllers.getBillById)

    // === RUTAS PARA CREAR/ACTUALIZAR/ELIMINAR FACTURAS ===
    .post('/', auth, role(['admin', 'employee']), BillsControllers.createBill)
    .put('/:id', auth, role(['admin']), BillsControllers.updateBill)
    .delete('/:id', auth, role(['admin']), BillsControllers.deleteBill)

export default router;