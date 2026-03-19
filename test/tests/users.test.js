import { jest } from '@jest/globals';
import request from 'supertest';

// Bcrypt hash de 'password123' — generado una vez, estático para velocidad
const HASHED_PASSWORD = '$2b$10$xMUlfndo7qJ89Qm.0ADev.rlQQN1JieXcx9Uyr5Ar3sbc/tY0mhSa';

const mockQuery = jest.fn();

// jest.unstable_mockModule es el patrón correcto para ESM.
// Debe llamarse ANTES de cualquier import dinámico del módulo afectado.
jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query: mockQuery,
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
    },
}));

// El import de app debe ser dinámico y posterior al mock
const { default: app } = await import('../../src/app.js');

describe('Auth API', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should login with valid credentials', async () => {
        mockQuery.mockResolvedValueOnce([[{
            id: 1,
            username: 'testuser',
            password: HASHED_PASSWORD,
            role: 'user',
        }]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
        mockQuery.mockResolvedValueOnce([[{
            id: 1,
            username: 'testuser',
            password: HASHED_PASSWORD,
            role: 'user',
        }]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'testuser', password: 'wrongpassword' });

        expect(res.statusCode).toEqual(401);
    });
});
