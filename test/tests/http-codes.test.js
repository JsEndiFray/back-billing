/**
 * HTTP status code correctness tests.
 *
 * Covers the codes that were wrong before the fixes:
 * - 409 used for "not found" → must be 404
 * - 200 with body on DELETE → must be 204 (no body)
 * - 204 with .json() body → must be 204 with no body (send())
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

const employeeToken = jwt.sign(
    { id: 2, username: 'tester', role: 'employee' },
    'test-jwt-secret-only-not-for-production',
    { expiresIn: '1h' }
);

describe('HTTP status codes — employee controller', () => {
    beforeEach(() => mockQuery.mockReset());

    it('GET /api/employee/search — employee not found → 404 (regression: was 409)', async () => {
        // Service returns empty array → controller should 404
        mockQuery.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .get('/api/employee/search?name=NoExiste')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.statusCode).toBe(404);
    });

    it('GET /api/employee/:id — employee not found → 404 (regression: was 409)', async () => {
        mockQuery.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .get('/api/employee/9999')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.statusCode).toBe(404);
    });

    it('DELETE /api/employee/:id — success → 204 with no body (regression: was 200 with body)', async () => {
        mockQuery.mockResolvedValueOnce([[{ affectedRows: 1 }]]);
        // deleteEmployee service calls deleteEmployee repo
        mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .delete('/api/employee/1')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);
        expect(res.body).toEqual({}); // 204 must have empty body
        expect(res.text).toBe('');   // no text body either
    });
});

describe('HTTP status codes — users controller', () => {
    beforeEach(() => mockQuery.mockReset());

    it('DELETE /api/users/:id — success → 204 with no body (regression: 204 with .json() body)', async () => {
        // UserService.deleteUser: findById first (SELECT), then delete (DELETE)
        mockQuery.mockResolvedValueOnce([[{ id: 1, username: 'test' }]]); // findById → rows=[{id:1}]
        mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);            // delete → affectedRows>0

        const res = await request(app)
            .delete('/api/users/1')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(204);
        expect(res.text).toBe('');
    });
});

describe('HTTP status codes — owners controller', () => {
    beforeEach(() => mockQuery.mockReset());

    it('PUT /api/owners/:id — owner not found on update → 404 (regression: was 409)', async () => {
        // validateOwners requires all fields; mock findById returning [] → service returns [] → 404
        mockQuery.mockResolvedValueOnce([[]]); // findById → rows=[] → owner not found

        const res = await request(app)
            .put('/api/owners/9999')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Updated Name',
                lastname: 'Test',
                email: 'test@test.com',
                identification: 'ABC12345',
                phone: '612345678',
                address: 'Calle Test 1',
                postal_code: '28001',
                location: 'Madrid',
                province: 'Madrid',
                country: 'España',
            });

        expect(res.statusCode).toBe(404);
    });
});
