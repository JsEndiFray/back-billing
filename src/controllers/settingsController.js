import SettingsServices from '../services/settingsServices.js';

export default class SettingsController {

    static async getSettings(req, res, next) {
        try {
            const settings = await SettingsServices.getSettings(req.user.id);
            return res.status(200).json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    static async updateSettings(req, res, next) {
        try {
            const updated = await SettingsServices.updateSettings(req.user.id, req.body);
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }
}
