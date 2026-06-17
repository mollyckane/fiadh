const express = require('express');
const router = express.Router();
const db = require('../config/db');
//import auth middleware to protect routes
const verifyToken = require('../middleware/auth');
const { verify } = require('jsonwebtoken');

//POST /api/invoices - save a new invoice
router.post('/', verifyToken, async (req, res) => {
    const{
        client_name, client_email, description, amount, vat_enabled, vat_amount, total, status, due_date, notes
    } = req.body;

    if(!client_name){
        return res.status(400).json({ error: 'Client name is required.'});
    }

    try{
        const [result] = await db.query(
            `INSERT INTO invoices
            (user_id, client_name, client_email, description, amount, vat_enabled, vat_amount, total, status, due_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.userId, client_name, client_email, description, amount, vat_enabled, vat_amount, total, status, due_date || null, notes]
        );
        res.status(201).json({ message: 'Invoice saved.', id: result.insertId });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.'});
    }
});

//GET /api/invoices - get all invoices for logged in user
router.get('/', verifyToken, async (req, res) => {
    try{
        const [rows] = await db.query(
            `SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC`,
            [req.userId]
        );
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error. '});
    }
});

module.exports = router;