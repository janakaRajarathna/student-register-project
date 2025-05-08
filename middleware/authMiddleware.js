const jwt = require('jsonwebtoken');

class AuthMiddleware {
    constructor(secretKey) {
        this.secretKey = secretKey;
    }

    // Generate JWT token
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        const token = jwt.sign(payload, this.secretKey, { expiresIn: '24h' });
        return token;
    }

    // Verify JWT token
    verifyToken(req, res, next) {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log('No token found');
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, this.secretKey);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token.' });
        }
    }

    // Check if user has specific role
    checkRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
            }

            next();
        };
    }

    // Redirect to login if not authenticated
    requireAuth(req, res, next) {
        console.log('requireAuth middleware called >>>');
        const token = req.cookies.token;
        console.log('Token from cookie:', token);

        if (!token) {
            console.log('No token found, redirecting to login');
            return res.redirect('/auth/login');
        }

        try {
            console.log('Verifying token with secret:', this.secretKey);
            const decoded = jwt.verify(token, this.secretKey);
            console.log('Token decoded successfully:', decoded);
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.clearCookie('token');
            res.redirect('/auth/login');
        }
    }
}

module.exports = AuthMiddleware; 