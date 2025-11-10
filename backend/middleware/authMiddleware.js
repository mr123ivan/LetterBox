// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Your MySQL connection pool

/**
 * Middleware function to check for and validate the JWT.
 * If valid, attaches the user's ID to req.user.
 */
const protect = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with 'Bearer'
    // Example: Authorization: Bearer <token_value>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header (split 'Bearer' from the token string)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // decoded will contain the payload we signed (e.g., { id: 123, iat: ..., exp: ... })

            // 3. Get user details from the DB based on the ID in the token
            // We select only necessary, non-sensitive data (NO password_hash)
            const [rows] = await db.execute('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);

            if (rows.length === 0) {
                // User ID in the token is valid, but no corresponding user exists in the DB
                res.status(401).json({ message: 'Not authorized, user in token not found' });
                return; 
            }

            // 4. Attach the user object to the request (req.user)
            req.user = rows[0]; 

            // Move to the next middleware or the controller function
            next(); 

        } catch (error) {
            // This catches expired tokens, invalid signatures, etc.
            console.error("JWT Verification Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
            return;
        }
    }

    if (!token) {
        // No token provided in the header
        res.status(401).json({ message: 'Not authorized, no token found' });
    }
};

module.exports = { protect };