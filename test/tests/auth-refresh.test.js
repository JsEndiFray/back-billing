import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// JWT_REFRESH_SECRET is set by test/setup.js
const REFRESH_SECRET  = 'test-refresh-secret-only-not-for-production';
const VALID_REFRESH_TOKEN = jwt.sign({ id: 1 }, REFRESH_SECRET, { expiresIn: '7d' });

const mockQuery     = jest.fn();
const mockConnQuery = jest.fn();
const mockConn = {
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    query:            mockConnQuery,
    commit:           jest.fn().mockResolvedValue(undefined),
    rollback:         jest.fn().mockResolvedValue(undefined),
    release:          jest.fn(),
};

jest.unstable_mockModule('../../src/db/dbConnect.js', () => ({
    default: {
        query:         mockQuery,
        getConnection: jest.fn().mockResolvedValue(mockConn),
    },
}));

const { default: app } = await import('../../src/app.js');

describe('Auth - refresh token rotation', () => {
    beforeEach(() => {
        mockQuery.mockReset();
        mockConnQuery.mockReset();
        mockConn.beginTransaction.mockClear().mockResolvedValue(undefined);
        mockConn.commit.mockClear().mockResolvedValue(undefined);
        mockConn.rollback.mockClear().mockResolvedValue(undefined);
        mockConn.release.mockClear();
    });

    it('issues new tokens for a valid refresh token', async () => {
        // 1. findValid (db.query) — token exists, not revoked
        mockQuery.mockResolvedValueOnce([[{
            id: 1, user_id: 1,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }]]);
        // 2. UsersRepository.findById (db.query)
        mockQuery.mockResolvedValueOnce([[{
            id: 1, username: 'testuser', role: 'user', password: 'hash',
        }]]);
        // 3. transaction: revoke (UPDATE) + save (INSERT)
        mockConnQuery
            .mockResolvedValueOnce([{ affectedRows: 1 }])
            .mockResolvedValueOnce([{ insertId: 2 }]);

        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken: VALID_REFRESH_TOKEN });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(mockConn.commit).toHaveBeenCalledTimes(1);
        expect(mockConn.rollback).not.toHaveBeenCalled();
    });

    it('rejects a token with invalid JWT signature', async () => {
        // verifyToken returns null immediately — no DB calls needed
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken: 'not.a.valid.jwt' });

        expect(res.status).toBe(401);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('rejects a revoked refresh token (valid JWT, DB says revoked)', async () => {
        // findValid returns empty — revoked tokens excluded by WHERE revoked=0
        mockQuery.mockResolvedValueOnce([[]]); // findValid returns nothing

        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken: VALID_REFRESH_TOKEN });

        expect(res.status).toBe(401);
    });
});
