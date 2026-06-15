const express = require('express');
const router = express.Router();
//bcrypt for password hashing - hash passwords before storing in database
const bcrypt = require('bcryptjs');
//jsonwebtoken for creating and verifying JWT tokens: each user gets a token upon login, which they can use to authenticate future requests
const jwt = require('jsonwebtoken');
//import database connection
const db = require('../config/db');

//---- ROUTES -----
// Register route - create new user
router.post('/register', async (req, res) => {
    //pull name, email, password from request body
    const { fname, lname, email, password } = req.body;
    //validate input - check that all required fields are provided
    if (!fname || !lname || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

    //try-catch for error handling
    try {
        //check if user exists
        const checkSql = 'SELECT * FROM users WHERE email = ?';
        const [existing] = await db.query(checkSql, [email]);

        //if user already exists with this email, return error 409
        if (existing.length > 0) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }
        
        // hash password before saving it, value of 10 is the salt rounds (higher is more secure but slower)
        const hashedPassword = await bcrypt.hash(password, 10);

        //SQL query to insert new user into database
        const sql = 'INSERT INTO users (fname, lname, email, password_hash) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [fname, lname, email, hashedPassword]);

        //create JWT
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '3h' });

        //respond
        //if successful:
        res.status(201).json({ token, message: 'User registered successfully.' });
    }
    catch (err) {
        console.error('Register route error: ', err);
        res.status(500).json({ error: err.message });
    }
});

// Login route - authenticate user and return JWT token
router.post('/login', async (req, res) => {
    console.log('Login route hit, body:', req.body);
    //pull email and password from request body
    const { email, password } = req.body;
    //validate input - check that all required fields are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

    //search database for user with this email
    const sql = 'SELECT * FROM users WHERE email = ?';

    try {
        console.log('About to run DB query for email:', email);
        const [results] = await db.query(sql, [email]);  // promise-based query
        console.log('DB query finished, results length:', results.length);
        //if no user found with this email, return error 401
        if (results.length === 0) return res.status(401).json({ error: 'User not found' });

        //grab first (and only) matching user from results
        const user = results[0];
        console.log('User found, id: ',user.id);

        //compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password_hash);

        //if passwords don't match, return error 401
        if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

        //if passwords match, create JWT token -  expires in three hours
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '3h' });

        //return token to client - they will use this token to authenticate future requests
        res.json({ token, message: 'Login successful.' });
        console.log('Login response sent for user id: ', user.id);
    }
    catch (err){
        console.error('Login route error:', err);
        return res.status(500).json({ error: err.message });
    }      
});


const verifyToken = require('../middleware/auth');

router.get('/me', verifyToken, (req, res) => {
    const sql = 'SELECT id, fname, lname, email FROM users WHERE id = ?';
    db.query(sql, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    });
});

module.exports = router;