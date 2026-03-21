/**
 * Invoices-received payment update tests.
 *
 * Regression guard: the controller was updated to read payment_status/payment_method
 * from the request body (public API field names) and map them internally to
 * collection_status/collection_method before calling the service.
 *
 * Key regressions covered:
 * - Sending payment_status/payment_method → 200 (correct API field names accepted)
 * - Sending collection_status/collection_method (old internal names) → 400 (rejected)
 * - Missing payment_method → 400
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/services/invoicesReceivedServices.js', () => ({
    default: {
        updatePaymentStatus: jest.fn(),
    },
}));

jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query: jest.fn(),
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
    },
}));

const { default: app } = await import('../../src/app.js');
const { default: InvoicesReceivedService } = await import('../../src/services/invoicesReceivedServices.js');

const adminToken = jwt.sign(
    { id: 1, username: 'testadmin', role: 'admin' },
    'test-jwt-secret-only-not-for-production',
    { expiresIn: '1h' }
);

describe('PUT /api/invoices-received/:id/payment — field name mapping', () => {
    beforeEach(() => InvoicesReceivedService.updatePaymentStatus.mockReset());

    it('payment_status + payment_method → 200 (correct public API field names)', async () => {
        InvoicesReceivedService.updatePaymentStatus.mockResolvedValueOnce([{ id: 1, updated: true }]);

        const res = await request(app)
            .put('/api/invoices-received/1/payment')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ payment_status: 'paid', payment_method: 'transfer' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('collection_status + collection_method (old internal names) → 400 (regression: these are not the API field names)', async () => {
        // Controller reads payment_status/payment_method — if old names are sent, it gets undefined → 400
        const res = await request(app)
            .put('/api/invoices-received/1/payment')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ collection_status: 'paid', collection_method: 'transfer' });

        expect(res.statusCode).toBe(400);
        // Service must NOT have been called — controller rejected before reaching it
        expect(InvoicesReceivedService.updatePaymentStatus).not.toHaveBeenCalled();
    });

    it('missing payment_method → 400', async () => {
        const res = await request(app)
            .put('/api/invoices-received/1/payment')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ payment_status: 'paid' });

        expect(res.statusCode).toBe(400);
        expect(InvoicesReceivedService.updatePaymentStatus).not.toHaveBeenCalled();
    });

    it('service returns [] (invoice not found) → 404', async () => {
        InvoicesReceivedService.updatePaymentStatus.mockResolvedValueOnce([]);

        const res = await request(app)
            .put('/api/invoices-received/9999/payment')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ payment_status: 'paid', payment_method: 'transfer' });

        expect(res.statusCode).toBe(404);
    });
});
