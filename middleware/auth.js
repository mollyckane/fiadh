/*
The middleware/auth.js file is responsible for 
verifying the JWT token sent by the user in the request headers. 
It checks if the token is present, verifies it using the 
secret keyand attaches the decoded user ID to the request 
object for use in protected routes.
*/

//import jsonwebtoken to verify token sent by user
const jwt = require('jsonwebtoken');

//function runs before any protected route, checks for token in header and verifies it
const verifyToken = (req, res, next) => {
    //token is sent in request headers under 'authorization'
    const authHeader = req.headers['authorization'];

    //if no token was provided, block request
    if(!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });

    //split the header to get the token (format is 'Bearer token')
    const token = authHeader.split(' ')[1];

    //verify token using secret key from environment variables
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        //if token is invalid/expired, block request
        if(err) return res.status(403).json({ message: 'Invalid or expired token.' });

        //attach decoded user ID to request so routes can use it
        req.userId = decoded.id;
        //move to the next route handler
        next();
    });
}

module.exports = verifyToken;