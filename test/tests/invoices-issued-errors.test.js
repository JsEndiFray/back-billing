/**
 * Invoices-issued service error code → HTTP response mapping tests.
 *
 * Regression guard: after the controller refactor, service errors are returned
 * as {error: 'CODE'} objects instead of null/[]. This suite verifies that each
 * error code maps to the correct HTTP status without secondary service calls.
 *
 * Covered:
 * - createInvoice: DUPLICATE → 409, INVALID_PROPORTIONAL → 400, DB_ERROR → 500
 * - createRefund:  NOT_FOUND → 404, CANNOT_REFUND_REFUND → 400
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock service before app import so the controller picks up the mock
jest.unstable_mockModule('../../src/services/invoicesIssuedServices.js', () => ({
    default: {
        createInvoice: jest.fn(),
        createRefund: jest.fn(),
    },
}));

jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query: jest.fn(),
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
    },
}));

const { default: app } = await import('../../src/app.js');
const { default: InvoicesIssuedService } = await import('../../src/services/invoicesIssuedServices.js');

const adminToken = jwt.sign(
    { id: 1, username: 'testadmin', role: 'admin' },
    'test-jwt-secret-only-not-for-production',
    { expiresIn: '1h' }
);

// Date guaranteed to pass validateCreateInvoiceIssued (not future, within 1 year)
const VALID_DATE = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const VALID_INVOICE_BODY = {
    clients_id: 1,
    owners_id: 1,
    estates_id: 1,
    invoice_date: VALID_DATE,
    tax_base: 1000,
    iva: 21,
    irpf: 15,
};

describe('Invoices issued — createInvoice service error codes', () => {
    beforeEach(() => InvoicesIssuedService.createInvoice.mockReset());

    it('service returns DUPLICATE → 409 Conflict', async () => {
        InvoicesIssuedService.createInvoice.mockResolvedValueOnce({ error: 'DUPLICATE' });

        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(VALID_INVOICE_BODY);

        expect(res.statusCode).toBe(409);
    });

    it('service returns INVALID_PROPORTIONAL → 400', async () => {
        InvoicesIssuedService.createInvoice.mockResolvedValueOnce({ error: 'INVALID_PROPORTIONAL' });

        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(VALID_INVOICE_BODY);

        expect(res.statusCode).toBe(400);
    });

    it('service returns DB_ERROR → 500', async () => {
        InvoicesIssuedService.createInvoice.mockResolvedValueOnce({ error: 'DB_ERROR' });

        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(VALID_INVOICE_BODY);

        expect(res.statusCode).toBe(500);
    });
});

describe('Invoices issued — createRefund service error codes', () => {
    beforeEach(() => InvoicesIssuedService.createRefund.mockReset());

    it('service returns NOT_FOUND → 404', async () => {
        InvoicesIssuedService.createRefund.mockResolvedValueOnce({ error: 'NOT_FOUND' });

        const res = await request(app)
            .post('/api/invoices-issued/refunds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ originalInvoiceId: 9999 });

        expect(res.statusCode).toBe(404);
    });

    it('service returns CANNOT_REFUND_REFUND → 400', async () => {
        InvoicesIssuedService.createRefund.mockResolvedValueOnce({ error: 'CANNOT_REFUND_REFUND' });

        const res = await request(app)
            .post('/api/invoices-issued/refunds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ originalInvoiceId: 1 });

        expect(res.statusCode).toBe(400);
    });
});
