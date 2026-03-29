import { jest } from '@jest/globals';
import request from 'supertest';

const mockGetConnection = jest.fn();

jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query:         jest.fn(),
        getConnection: mockGetConnection,
    },
}));

const { default: app } = await import('../../src/app.js');

describe('GET /api/health', () => {
    beforeEach(() => {
        mockGetConnection.mockReset();
    });

    it('returns 200 with status ok when DB is reachable', async () => {
        mockGetConnection.mockResolvedValueOnce({ release: jest.fn() });

        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ status: 'ok', db: 'ok' });
        expect(res.body).toHaveProperty('uptime');
    });

    it('returns 503 with status degraded when DB is unreachable', async () => {
        mockGetConnection.mockRejectedValueOnce(new Error('ECONNREFUSED'));

        const res = await request(app).get('/api/health');

        expect(res.status).toBe(503);
        expect(res.body).toMatchObject({ status: 'degraded', db: 'error' });
    });
});
