import BillsService from "../services/billsServices.js";
import {ErrorMessage} from "../helpers/msgError.js";
import {validate} from "../helpers/nifHelpers.js";


export default class BillsControllers {
    //obtener las facturas
    static async getAllBills(req, res) {
        try {
            const bills = await BillsService.getAllBills();
            if (!bills || bills.length === 0) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.NO_DATA})
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, taxes: bills});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //MÉTODOS DE BÚSQUEDAS

    //búsqueda por numero de factura.
    static async getBillNumber(req, res) {
        try {
            const {bill_number} = req.params;
            const billNumberSanitized = bill_number.trim();
            if (!billNumberSanitized) {
                return res.status(404).json({msg: ErrorMessage.BILLS.NOT_FOUND});
            }
            const bills = await BillsService.getBillByNumber(billNumberSanitized);
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, bills: bills});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por ID
    static async getBillById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const result = await BillsService.getBillById(id);
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.BILLS.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, bill: result})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por id_owners
    static async getOwnersId(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const result = await BillsService.getByOwnersId(id);
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.BILLS.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, bills: result})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //búsqueda por id_cliente
    static async getByClientsId(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }
            const result = await BillsService.getByClientsId(id);
            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.BILLS.NOT_FOUND});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, bills: result})

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }

    //BÚSQUEDA HISTORIAL FACTURA POR NIF
    // búsqueda por NIF del cliente
    static async getBillsByClientNif(req, res) {
        try {
            const {nif} = req.params;
            if (!validate(nif)) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID});
            }

            const result = await BillsService.getBillsByClientNif(nif);

            if (!result || result.length === 0) {
                return res.status(404).json({msg: ErrorMessage.BILLS.NOT_FOUND});
            }

            return res.status(200).json({msg: ErrorMessage.GLOBAL.DATA, data: result});
        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL});
        }
    }


    //SIGUIENTE MÉTODOS CREATE, UPDATE, DELETE
    static async createBill(req, res) {
        try {
            const data = req.body;
            const created = await BillsService.createBill(data);
            if (!created) {
                return res.status(400).json({msg: ErrorMessage.BILLS.ERROR_CREATE});
            }
            return res.status(201).json({msg: ErrorMessage.GLOBAL.CREATE, Bill: created});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //actualizar facturas
    static async updateBill(req, res) {
        try {
            const {id} = req.params;
            const updateData = req.body;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const existing = await BillsService.getBillById(id);
            if (!existing) {
                return res.status(404).json({msg: ErrorMessage.BILLS.NOT_FOUND});

            }
            const updated = await BillsService.updateBill(Number(id), updateData);
            if (!updated) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.ERROR_UPDATE});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.UPDATE, Bill: updated});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }

    //ELIMINAR FACTURAS
    static async deleteBill(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({msg: ErrorMessage.GLOBAL.INVALID_ID})
            }
            const deleted = await BillsService.deleteBill(id);
            if (!deleted) {
                return res.status(404).json({msg: ErrorMessage.GLOBAL.ERROR_DELETE});
            }
            return res.status(200).json({msg: ErrorMessage.GLOBAL.DELETE});

        } catch (error) {
            return res.status(500).json({msg: ErrorMessage.GLOBAL.INTERNAL})
        }
    }


}