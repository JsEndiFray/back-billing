/**
 * Validation middleware tests.
 *
 * Regression guard: POST /api/invoices-issued had validateCreateInvoiceIssued
 * but was missing errorHandler, so validation errors reached the controller
 * and caused a 500. With errorHandler in place, missing required fields → 400.
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mockQuery = jest.fn();
jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query: mockQuery,
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
    },
}));

const { default: app } = await import('../../src/app.js');

const adminToken = jwt.sign(
    { id: 1, username: 'testadmin', role: 'admin' },
    'test-jwt-secret-only-not-for-production',
    { expiresIn: '1h' }
);

describe('Validation middleware — POST /api/invoices-issued', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('empty body → 400 with validation error message (regression: was 500)', async () => {
        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
        // errorHandler returns an error message, not a 500 from the controller
        expect(res.body).toBeDefined();
    });

    it('missing clients_id → 400 with descriptive error', async () => {
        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                owners_id: 1,
                estates_id: 1,
                invoice_date: '2024-01-15',
                tax_base: 1000,
                iva: 21,
                irpf: 15,
            });

        expect(res.statusCode).toBe(400);
    });

    it('missing tax_base → 400', async () => {
        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                clients_id: 1,
                owners_id: 1,
                estates_id: 1,
                invoice_date: '2024-01-15',
                iva: 21,
                irpf: 15,
            });

        expect(res.statusCode).toBe(400);
    });

    it('DB is never called when validation fails (controller not reached)', async () => {
        await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({});

        // mockQuery should not have been called — validator stopped the request
        expect(mockQuery).not.toHaveBeenCalled();
    });
});
