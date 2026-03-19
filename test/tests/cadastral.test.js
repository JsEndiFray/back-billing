/**
 * Cadastral controller tests.
 *
 * Critical regression guard: the catch block in validateCadastralReference
 * previously returned { isValid: true } on a server error, which would let
 * invalid references pass validation silently. It must now return isValid: false.
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/services/cadastralService.js', () => ({
    default: {
        validate: jest.fn(),
    },
}));

jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query: jest.fn(),
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
    },
}));

const { default: app } = await import('../../src/app.js');
const { default: CadastralService } = await import('../../src/services/cadastralService.js');

const employeeToken = jwt.sign(
    { id: 1, username: 'tester', role: 'employee' },
    'test-jwt-secret-only-not-for-production',
    { expiresIn: '1h' }
);

describe('Cadastral Controller', () => {
    beforeEach(() => {
        CadastralService.validate.mockReset();
    });

    it('GET /api/cadastral/health — responds 200 without auth', async () => {
        const res = await request(app).get('/api/cadastral/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('when service throws → returns 500 with isValid: false (never isValid: true)', async () => {
        CadastralService.validate.mockRejectedValueOnce(new Error('External API unreachable'));

        const res = await request(app)
            .get('/api/cadastral/validate/1234567890ABCDEFGH')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.statusCode).toBe(500);
        expect(res.body.isValid).toBe(false);
        // Regression: the old code returned isValid: true here
    });

    it('when service returns valid result → passes it through as 200', async () => {
        CadastralService.validate.mockResolvedValueOnce({ isValid: true, reference: '1234567890ABCDEF' });

        const res = await request(app)
            .get('/api/cadastral/validate/1234567890ABCDEF')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.isValid).toBe(true);
    });

    it('when service returns invalid result → passes it through as 200', async () => {
        CadastralService.validate.mockResolvedValueOnce({ isValid: false, message: 'Reference not found' });

        const res = await request(app)
            .get('/api/cadastral/validate/XXXXXXXXXXXXXXXXXX')
            .set('Authorization', `Bearer ${employeeToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.isValid).toBe(false);
    });
});
