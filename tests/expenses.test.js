jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const app = require('../server');

describe('Expenses routes', () => {
    let token;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    //missing token test
    test('GET /api/expenses returns 401 when no token is provided', async () => {
        const res = await request(app).get('/api/expenses');

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/no token provided/i);
    });

    //invalid token test
    test('GET /api/income returns 403 when token is invalid', async () => {
        const res = await request(app)
            .get('/api/income')
            .set('Authorization', 'Bearer bad-token');

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/invalid or expired token/i);
    });

    //invalid amount test
    test('POST /api/expenses returns 400 when amount is invalid', async () => {
        const res = await request(app)
            .post('/api/expenses')
            .set('Authorization', `Bearer ${token}`)
            .send({
                amount: -5,
                category: 'Travel'
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/valid amount/i);
    });

    //retrieve expenses test
    test('GET /api/expenses returns expense rows for authenticated user', async () => {
        db.query.mockResolvedValueOnce([[
            {
                id: 20,
                user_id: 1,
                amount: 55,
                category: 'Materials'
            }
        ]]);

        const res = await request(app)
            .get('/api/expenses')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].category).toBe('Materials');
    });

    test('GET /api/expenses/:id returns 404 when entry is not found', async () => {
        db.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .get('/api/expenses/999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/entry not found/i);
    });
});