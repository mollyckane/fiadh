const express = require('express');
const router = express.Router();

// TODO: add routes here

//import auth middleware to protect routes
const verifyToken = require('../middleware/auth');

//TEST protected route - verifyToken runs before callback
router.get('/', verifyToken, (req, res) => { 
    res.json({ message: `Hello user ${req.userId}, this is a protected route!`, userId: req.userId });
});

module.exports = router;