/**
 * Invoices-issued service error → HTTP response mapping tests.
 *
 * Regression guard: after the AppError migration, service errors are thrown
 * as AppError instances instead of returned as {error: 'CODE'} objects.
 * This suite verifies that each error maps to the correct HTTP status.
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
const { AppError } = await import('../../src/errors/AppError.js');

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

    it('service throws DUPLICATE AppError → 409 Conflict', async () => {
        InvoicesIssuedService.createInvoice.mockRejectedValueOnce(new AppError('Ya existe una factura para este cliente en esa propiedad y mes', 409));

        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(VALID_INVOICE_BODY);

        expect(res.statusCode).toBe(409);
    });

    it('service throws INVALID_PROPORTIONAL AppError → 400', async () => {
        InvoicesIssuedService.createInvoice.mockRejectedValueOnce(new AppError('Error en campos proporcionales de la factura', 400));

        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(VALID_INVOICE_BODY);

        expect(res.statusCode).toBe(400);
    });

    it('service throws DB_ERROR AppError → 500', async () => {
        InvoicesIssuedService.createInvoice.mockRejectedValueOnce(new AppError('Error al crear factura: La operación no se completó correctamente', 500));

        const res = await request(app)
            .post('/api/invoices-issued')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(VALID_INVOICE_BODY);

        expect(res.statusCode).toBe(500);
    });
});

describe('Invoices issued — createRefund service error codes', () => {
    beforeEach(() => InvoicesIssuedService.createRefund.mockReset());

    it('service throws NOT_FOUND AppError → 404', async () => {
        InvoicesIssuedService.createRefund.mockRejectedValueOnce(new AppError('Factura original no encontrada', 404));

        const res = await request(app)
            .post('/api/invoices-issued/refunds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ originalInvoiceId: 9999 });

        expect(res.statusCode).toBe(404);
    });

    it('service throws CANNOT_REFUND_REFUND AppError → 400', async () => {
        InvoicesIssuedService.createRefund.mockRejectedValueOnce(new AppError('No se puede crear un abono a partir de otro abono', 400));

        const res = await request(app)
            .post('/api/invoices-issued/refunds')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ originalInvoiceId: 1 });

        expect(res.statusCode).toBe(400);
    });
});
