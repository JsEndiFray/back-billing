/**
 * Security tests — auth middleware protection on critical routes.
 *
 * Verifies that every protected endpoint rejects unauthenticated requests
 * with 401. The key regression guard here is POST /api/users, which was
 * publicly accessible before the security fix.
 */
import { jest } from '@jest/globals';
import request from 'supertest';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query: mockQuery,
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
    },
}));

const { default: app } = await import('../../src/app.js');

describe('Security — unauthenticated requests must be rejected', () => {

    it('POST /api/users — 401 without token (regression: was publicly accessible)', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'hacker', email: 'h@x.com', password: '123456' });
        expect(res.statusCode).toBe(401);
    });

    it('POST /api/invoices-issued — 401 without token', async () => {
        const res = await request(app)
            .post('/api/invoices-issued')
            .send({ clients_id: 1, owners_id: 1, estates_id: 1 });
        expect(res.statusCode).toBe(401);
    });

    it('DELETE /api/users/1 — 401 without token', async () => {
        const res = await request(app).delete('/api/users/1');
        expect(res.statusCode).toBe(401);
    });

    it('DELETE /api/employee/1 — 401 without token', async () => {
        const res = await request(app).delete('/api/employee/1');
        expect(res.statusCode).toBe(401);
    });

    it('PUT /api/invoices-received/1/payment — 401 without token', async () => {
        const res = await request(app)
            .put('/api/invoices-received/1/payment')
            .send({ payment_status: 'paid', payment_method: 'transfer' });
        expect(res.statusCode).toBe(401);
    });
});
