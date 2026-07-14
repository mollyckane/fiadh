jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const app = require('../server');

describe('Auth routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    test('POST /api/auth/register returns 400 when fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fname: 'Molly',
                email: 'molly@example.com'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('All fields are required');
    });

    test('POST /api/auth/register returns 409 when email already exists', async () => {
        db.query.mockResolvedValueOnce([[{ id: 1, email: 'molly@example.com' }]]);

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fname: 'Molly',
                lname: 'Kane',
                email: 'molly@example.com',
                password: 'Password123!'
            });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('User already exists with this email');
    });

    test('POST /api/auth/login returns 401 when user is not found', async () => {
        db.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'missing@example.com',
                password: 'Password123!'
            });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('User not found');
    });

    test('POST /api/auth/login returns 401 when password is incorrect', async () => {
        const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);

        db.query.mockResolvedValueOnce([[
            {
                id: 1,
                email: 'molly@example.com',
                password_hash: hashedPassword
            }
        ]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'molly@example.com',
                password: 'WrongPassword123!'
            });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Incorrect password');
    });

    test('GET /api/auth/me returns 401 when no token is provided', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Access denied. No token provided.');
    });

    test('GET /api/auth/me returns 403 when token is invalid', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer bad-token');

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Invalid or expired token.');
    });
});