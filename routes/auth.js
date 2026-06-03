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
    //validate input - check that all required fields are provided
    if (!fname || !lname || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    //pull name, email, password from request body
    const { fname, lname, email, password } = req.body;

    //try-catch for error handling
    try {
        const checkSql = 'SELECT * FROM users WHERE email = ?';
        db.query(checkSql, [email], async (err, results) =>{
            if(err){ return res.status(500).json({ error: err.message });
            }

            //if user already exists with this email, return error 409
            if(results.length > 0){ return res.status(409).json({ error: 'User already exists with this email' });
            }
            //hash password before saving it, value of 10 is the salt rounds (higher is more secure but slower)
            const hashedPassword = await bcrypt.hash(password, 10);


            //SQL query to insert new user into database
            const sql = 'INSERT INTO users (fname, lname, email, password_hash) VALUES (?, ?, ?, ?)';

            //run query
            //prevent SQL injection attacks by using parameterized queries (the ? placeholders) instead of directly inserting user input into the query string
            db.query(sql, [fname, lname, email, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1d' });
                //if successful:
                res.status(201).json({ token, message: 'User registered successfully.' });
            });    
        });            
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login route - authenticate user and return JWT token
router.post('/login', (req, res) => {
    //validate input - check that all required fields are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

    //pull email and password from request body
    const { email, password } = req.body;

    //search database for user with this email
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if(err) return res.status(500).json({ error: err.message});

        //if no user found with this email, return error 401
        if (results.length === 0) return res.status(401).json({ error: 'User not found'});

        //grab first (and only) matching user from results
        const user = results[0];

        //compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password_hash);

        //if passwords don't match, return error 401
        if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

        //if passwords match, create JWT token -  expires in one day
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        //return token to client - they will use this token to authenticate future requests
        res.json({ token, message: 'Login successful.'});
    });
})

module.exports = router;