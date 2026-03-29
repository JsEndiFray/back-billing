import db from '../db/dbConnect.js';

export default class HealthController {

    static async check(req, res) {
        let dbStatus = 'ok';
        try {
            const conn = await db.getConnection();
            conn.release();
        } catch {
            dbStatus = 'error';
        }

        const status = dbStatus === 'ok' ? 'ok' : 'degraded';
        const httpCode = status === 'ok' ? 200 : 503;

        return res.status(httpCode).json({
            status,
            db:     dbStatus,
            uptime: Math.floor(process.uptime()),
        });
    }
}
