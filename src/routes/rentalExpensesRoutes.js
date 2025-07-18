import express, {Router} from "express";
import RentalExpensesControllers from "../controllers/rentalExpensesControllers.js";

const router = express.Router()

    // ========================================
    // 🔧 RUTAS ESPECÍFICAS PRIMERO (ORDEN CORRECTO)
    // ========================================

    // Obtener todos los gastos
    .get('/', RentalExpensesControllers.getAllExpenses)

    // Crear nuevo gasto
    .post('/', RentalExpensesControllers.createRentalExpenses)

    // ========================================
    // RUTAS DE BÚSQUEDA - ESPECÍFICAS PRIMERO
    // ========================================

    // Buscar por tipo de propiedad
    .post('/search/property-type', RentalExpensesControllers.getByPropertyType)

    // Buscar por nombre de propiedad
    .post('/search/property-name', RentalExpensesControllers.getByPropertyName)

    // Buscar por número de gasto
    .get('/search/number/:expense_number', RentalExpensesControllers.getByExpenseNumber)

    // ========================================
    // RUTAS PARA ABONOS (ESPECÍFICAS PRIMERO)
    // ========================================

    // Obtener todos los abonos
    .get('/refunds', RentalExpensesControllers.getAllRefunds)

    // Crear abono basado en gasto original
    .post('/refunds', RentalExpensesControllers.createRefund)

    // Obtener abono con detalles completos (ANTES que /:id)
    .get('/refunds/:id/details', RentalExpensesControllers.getRefundWithDetails)

    // Descargar PDF del abono (ANTES que /:id)
    .get('/refunds/:id/pdf', RentalExpensesControllers.downloadRefundPdf)

    // Obtener abono específico por ID (DESPUÉS de las rutas específicas)
    .get('/refunds/:id', RentalExpensesControllers.getRefundById)

    // ========================================
    // RUTAS DE REPORTES (ESPECÍFICAS PRIMERO)
    // ========================================

    // Obtener resumen de gastos vs abonos por propiedad
    .get('/reports/summary/:property_name', RentalExpensesControllers.getExpenseSummaryByProperty)

    // Obtener balance neto (gastos - abonos) por período
    .post('/reports/balance', RentalExpensesControllers.getNetBalanceByPeriod)

    // ========================================
    // 🆕 RUTAS PROPORCIONALES (NUEVAS)
    // ========================================

    // Validar rango de fechas para facturación proporcional
    .post('/validate-proportional-dates', RentalExpensesControllers.validateProportionalDateRange)

    // Simular cálculo proporcional sin guardar
    .post('/simulate-proportional', RentalExpensesControllers.simulateProportionalExpense)

    // ========================================
    // RUTAS CON PARÁMETROS ID (AL FINAL)
    // ========================================

    // Obtener detalles de cálculo proporcional de un gasto
    .get('/:id/proportional-details', RentalExpensesControllers.getProportionalCalculationDetails)

    // Obtener gasto con detalles completos (ANTES que /:id)
    .get('/:id/details', RentalExpensesControllers.getExpenseWithDetails)

    // Descargar PDF de gasto específico (ANTES que /:id)
    .get('/:id/pdf', RentalExpensesControllers.downloadExpensePdf)

    // Actualizar estado de pago de un gasto
    .put('/:id/payment', RentalExpensesControllers.updatePaymentStatus)

    // Obtener gasto por ID (DESPUÉS de las rutas específicas)
    .get('/:id', RentalExpensesControllers.getRentalExpenseById)

    // Actualizar gasto por ID
    .put('/:id', RentalExpensesControllers.updateRentalExpenses)

    // Eliminar gasto por ID
    .delete('/:id', RentalExpensesControllers.deleteRentalExpenses)

export default router;