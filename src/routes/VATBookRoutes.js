import express from 'express';
import VATBookController from '../controllers/VATBookController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';


const router = express.Router();

router
    // Supported
    .get('/supported/:year', auth, role(['admin', 'employee']), VATBookController.getVATSupportedBook)
    .get('/supported/:year/:quarter', auth, role(['admin', 'employee']), VATBookController.getVATSupportedBook)
    .get('/supported/:year/:quarter/:month', auth, role(['admin', 'employee']), VATBookController.getVATSupportedBook)

    // Charged
    .get('/charged/:year', auth, role(['admin', 'employee']), VATBookController.getVATChargedBook)
    .get('/charged/:year/:quarter', auth, role(['admin', 'employee']), VATBookController.getVATChargedBook)
    .get('/charged/:year/:quarter/:month', auth, role(['admin', 'employee']), VATBookController.getVATChargedBook)

    // By Owner
    .get('/by-owner/:year', auth, role(['admin', 'employee']), VATBookController.getVATBookByOwner)
    .get('/by-owner/:year/:quarter', auth, role(['admin', 'employee']), VATBookController.getVATBookByOwner)
    .get('/by-owner/:year/:quarter/:month', auth, role(['admin', 'employee']), VATBookController.getVATBookByOwner)

    // Consolidated (para el componente)
    .get('/consolidated/:year', auth, role(['admin', 'employee']), VATBookController.getConsolidatedVATBook)
    .get('/consolidated/:year/:quarter', auth, role(['admin', 'employee']), VATBookController.getConsolidatedVATBook)
    .get('/consolidated/:year/:quarter/:month', auth, role(['admin', 'employee']), VATBookController.getConsolidatedVATBook)

    // Complete
    .get('/complete/:year', auth, role(['admin', 'employee']), VATBookController.getCompleteVATBooks)
    .get('/liquidation/:year/:quarter', auth, role(['admin', 'employee']), VATBookController.getQuarterlyVATLiquidation)

    // Exportación
    .post('/export/excel', auth, role(['admin', 'employee']), VATBookController.exportVATBookToExcel)
    .post('/download/excel', auth, role(['admin', 'employee']), VATBookController.downloadVATBookExcel)
    .post('/download/pdf', auth, role(['admin', 'employee']), VATBookController.downloadVATBookPDF)


    // Stats
    .get('/stats/:year', auth, role(['admin', 'employee']), VATBookController.getAnnualVATStats)
    .get('/comparison/:year', auth, role(['admin', 'employee']), VATBookController.getQuarterlyVATComparison)

    // Config
    .get('/config', auth, role(['admin', 'employee']), VATBookController.getVATBookConfig)
    .post('/validate-company', auth, role(['admin', 'employee']), VATBookController.validateCompanyData);


export default router;