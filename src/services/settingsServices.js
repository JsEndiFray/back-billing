import SettingsRepository from '../repository/settingsRepository.js';
import { AppError } from '../errors/AppError.js';

export default class SettingsServices {

    static async getSettings(userId) {
        const rows = await SettingsRepository.findByUserId(userId);
        if (!rows.length) throw new AppError('Usuario no encontrado', 404);
        return rows[0];
    }

    static async updateSettings(userId, data) {
        await SettingsRepository.upsert(userId, data);
        return await this.getSettings(userId);
    }
}
