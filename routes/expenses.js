const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

//POST /api/expenses - log a new expense entry
router.post('/', verifyToken, async (req, res) => {
    const { amount, category, entry_date, notes } = req.body;

    if(!amount || isNaN(amount) || amount <=0){
        return res.status(400).json({ error: 'A valid amount is required' });
    }
    try{
        const [result] = await db.query(
            `INSERT INTO expenses (user_id, amount, category, entry_date, notes)
            VALUES (?, ?, ?, ?, ?)`,
            [req.userId, amount, category || null,  entry_date || null, notes || null]
        );
        res.status(201).json({ message: 'Expense entry saved.', id: result.insertId });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

//GET /api/expenses - get all expense entries for logged in user
router.get('/', verifyToken, async (req, res) => {
    try{
        const [rows] = await db.query(
            `SELECT * FROM expenses WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC`,
            [req.userId]
        );
        res.json(rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

//GET /api/expenses/:id - get single expense entry
router.get('/:id', verifyToken, async (req, res) => {
    try{
        const [rows] = await db.query(
            `SELECT * FROM expenses WHERE id = ? AND user_id = ?`,
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

//PUT /api/expenses/:id - update an expenses entry
router.put('/:id', verifyToken, async (req, res) => {
    const { amount, category, entry_date, notes } = req.body;

        if(!amount || isNaN(amount) || amount <= 0){
            return res.status(400).json({ error: 'A valid amount is required.' });
        }

        try{
            const [result] = await db.query(
                `UPDATE expenses SET amount=?, category=?, entry_date=?, notes=?
                WHERE id = ? AND user_id=?`,
                [amount, category || null, entry_date || null, notes || null, req.params.id, req.userId]
            );
            if(result.affectedRows === 0){
                return res.status(404).json({ error: 'Entry not found.' });
            }
            res.json({ message: 'Expense entry updated.' });
        }
        catch(err){
            console.error(err);
            res.status(500).json({ error: 'Server error.' });
        }
});

// DELETE /api/expenses/:id - delete an expenses entry
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await db.query(
            `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
            [req.params.id, req.userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found.' });
        }
        res.json({ message: 'Expense entry deleted.' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;