const express = require('express');
const router = express.Router();
const db = require('../config/db');
//import auth middleware to protect routes
const verifyToken = require('../middleware/auth');

//POST /api/invoices - save a new invoice
router.post('/', verifyToken, async (req, res) => {
    const{
        client_name, client_email, client_address, description, amount, vat_enabled, vat_amount, total, status, due_date, notes, items
    } = req.body;

    if(!client_name){
        return res.status(400).json({ error: 'Client name is required.'});
    }

    try{
        const [result] = await db.query(
            `INSERT INTO invoices
            (user_id, client_name, client_email, client_address, description, amount, vat_enabled, vat_amount, total, status, due_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.userId, client_name, client_email, client_address, description, amount, vat_enabled, vat_amount, total, status, due_date || null, notes]
        );

        const invoiceId = result.insertId;

        //insert lines items
        if(items && items.length > 0){
            const itemRows = items.map(item => [invoiceId, item.description, item.quantity, item.rate, item.total ]);
            await db.query(
                `INSERT INTO invoice_items (invoice_id, description, quantity, rate, total) VALUES ?`,
                [itemRows]
            );
        }

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
            `SELECT * FROM invoices WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC`,
            [req.userId]
        );
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error. '});
    }
});

//DELETE (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try{
        const [result] = await db.query(`UPDATE invoices SET is_deleted = 1 WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
        );
        if(result.affectedRows === 0){
            return res.status(404).json ({ error: 'Invoice not found.'});
        }
        res.json({ message: 'Invoice deleted.'});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: 'Server error.'});
    }
});

//update status only
router.patch('/:id/status', verifyToken, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'paid', 'overdue'];
    if(!validStatuses.includes(status)){
        return res.status(400).json({ error: 'Invalid status. '});
    }
    try{
        const [result] = await db.query(
            `UPDATE invoices SET status = ? WHERE id = ? AND user_id = ? AND is_deleted = 0`,
            [status, req.params.id, req.userId]
        );
        if(result.affectedRows === 0){
            return res.status(404).json({ error: 'Invoice not found.' });
        }
        res.json({ message: 'Status updated.'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

//single invoice with line items
router.get('/:id', verifyToken, async (req, res) => {
    try{
        const [invoices] = await db.query(
            `SELECT * FROM invoices WHERE id = ? AND user_id = ? AND is_deleted=0`,
            [req.params.id, req.userId]
        );
        if(invoices.length === 0){
            return res.status(404).json({ error: 'Invoice not found.'});
        }
        const [items] = await db.query(
            `SELECT * FROM invoice_items WHERE invoice_id = ?`,
            [req.params.id]
        );
        res.json({...invoices[0], items});
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.'});
    }
});

//full edit
router.put('/:id', verifyToken, async (req, res) => {
    const { client_name, client_email, client_address, description, 
            amount, vat_enabled, vat_amount, total, 
            status, due_date, notes, items } = req.body;

    if(!client_name){
        return res.status(400).json({ error: 'Client name is required.'});
    }
    try{
        const [result] = await db.query(
            `UPDATE invoices SET client_name=?, client_email=?, client_address=?, description=?, amount=?, vat_enabled=?, vat_amount=?, total=?, status=?, due_date=?, notes=?
            WHERE id = ? AND user_id = ? AND is_deleted = 0`,
            [client_name, client_email, client_address, description, amount, vat_enabled, vat_amount, total, status, due_date || null, notes, req.params.id, req.userId]
        );
        if(result.affectedRows === 0){
            return res.status(404).json({ error:' Invoice not found'});
        }
        //replace line items
        await db.query(`DELETE FROM invoice_items WHERE invoice_id = ?`, [req.params.id]);
        if(items && items.length > 0){
            const itemRows = items.map(item => [req.params.id, item.description, item.quantity, item.rate, item.total]);
            await db.query(`INSERT INTO invoice_items (invoice_id, description, quantity, rate, total) VALUES ?`,
                [itemRows]
            );
        }
        res.json({ message: 'Invoice updated.' });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error. '});
    }
});

module.exports = router;