/*
This file contains unit tests for the invoice routes of the application.
It uses Jest and Supertest to test the GET, POST and DELETE endpoints for invoices.
*/

jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const app = require('../server');

describe('Invoice routes', () => {
    let token;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { 
            expiresIn: '1h'
        });
    });

    //missing token test
    test('GET /api/invoices returns 401 when no token is provided', async () => {
        const res = await request(app).get('/api/invoices');

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/no token provided/i);
    });

    //invalid token test
    test('GET /api/invoices returns 403 when token is invalid', async () => {
        const res = await request(app)
            .get('/api/invoices')
            .set('Authorization', 'Bearer bad-token');

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/invalid or expired token/i);
    });

    //missing client name test
    test('POST /api/invoices returns 400 when no client name is provided', async () => {
        const res = await request(app).post('/api/invoices').set('Authorization', `Bearer ${token}`).send({
            client_email: 'test@email.com'
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/client name is required/i);
    });

    //return saved invoices test
    test('GET /api/invoices returns saved invoices for authenticated user', async () => {
        db.query.mockResolvedValueOnce([[ 
            {
                id: 1, 
                user_id: 1, 
                client_name: 'John Bob', 
                client_email: 'john@bob.com',
                client_address: '123 john lane', 
                description: 'invoice test', 
                amount: 500.0, 
                vat_enabled: 0,
                vat_amount: null,
                total: 500.0, 
                status: 'draft', 
                is_deleted: 0, 
                created_at: '2026-07-16T12:00:00.000Z'
            }
        ]]);

        const res = await request(app).get('/api/invoices').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].client_name).toBe('John Bob');
        expect(res.body[0].status).toBe('draft');
        expect(res.body[0].total).toBe(500.0); 
    });

    //invoice not found
    test('GET /api/invoices/:id returns 404 when invoice is not found', async () => {
        db.query.mockResolvedValueOnce([[]]);

        const res = await request(app).get('/api/invoices/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/invoice not found/i);
    });

});