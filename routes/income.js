const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

//POST /api/income - log a new income entry
router.post('/', verifyToken, async (req, res) => {
    const { amount, source, category, entry_date, notes } = req.body;

    if(!amount || isNaN(amount) || amount <=0){
        return res.status(400).json({ error: 'A valid amount is required' });
    }
    try{
        const [result] = await db.query(
            `INSERT INTO income (user_id, amount, source, category, entry_date, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [req.userId, amount, source || null, category || null, entry_date || null, notes || null]
        );
        res.status(201).json({ message: 'Income entry saved.', id: result.insertId });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

//GET /api/income - get all income entries for logged in user
router.get('/', verifyToken, async (req, res) => {
    try{
        const [rows] = await db.query(
            `SELECT * FROM income WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC`,
            [req.userId]
        );
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

//GET /api/income/:id - get single income entry
router.get('/:id', verifyToken, async (req, res) => {
    try{
        const [rows] = await db.query(
            `SELECT * FROM income WHERE id = ? AND user_id = ?`,
            [req.params.id, req.userId]
        );
        if(rows.length === 0){
            return res.status(404).json({ error: 'Entry not found.' });
        }
        res.json(rows[0]);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

//PUT /api/income/:id - update an income entry
router.put('/:id', verifyToken, async (req, res) => {
    const { amount, source, category, entry_date, notes } = req.body;

        if(!amount || isNaN(amount) || amount <= 0){
            return res.status(400).json({ error: 'A valid amount is required.' });
        }

        try{
            const [result] = await db.query(
                `UPDATE income SET amount=?, source=?, category=?, entry_date=?, notes=?
                WHERE id = ? AND user_id=?`,
                [amount, source || null, category || null, entry_date || null, notes || null, req.params.id, req.userId]
            );
            if(result.affectedRows === 0){
                return res.status(404).json({ error: 'Entry not found.' });
            }
            res.json({ message: 'Income entry updated.' });
        }
        catch(err){
            console.error(err);
            res.status(500).json({ error: 'Server error.' });
        }
});

// DELETE /api/income/:id - delete an income entry
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await db.query(
            `DELETE FROM income WHERE id = ? AND user_id = ?`,
            [req.params.id, req.userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found.' });
        }
        res.json({ message: 'Income entry deleted.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;