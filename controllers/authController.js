const User = require('../models/User');
const AuthMiddleware = require('../middleware/authMiddleware');

class AuthController {
    constructor(db) {
        this.userModel = new User(db);
    }

    // Render login page
    getLogin(req, res) {
        res.render('login', { error: null });
    }

    // Handle login form submission
    async postLogin(req, res) {
        try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email);

            // Find user by email
            const user = await this.userModel.findByEmail(email);
            if (!user) {
                console.log('User not found');
                return res.render('login', {
                    error: 'Invalid email or password'
                });
            }

            // Verify password
            const isValidPassword = await this.userModel.verifyPassword(password, user.password);
            if (!isValidPassword) {
                console.log('Invalid password');
                return res.render('login', {
                    error: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const token = req.authMiddleware.generateToken(user);
            console.log('Token generated for user:', user.id);

            // Set token in cookie with proper options
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            // Set user in session for immediate access
            req.session.user = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            // Redirect based on role
            console.log('Redirecting user with role:', user.role);
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else if (user.role === 'lecturer') {
                res.redirect('/lecturer/dashboard');
            } else {
                res.redirect('/student/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            res.render('login', {
                error: 'An error occurred during login'
            });
        }
    }

    // Handle logout
    logout(req, res) {
        res.clearCookie('token');
        req.session.destroy();
        res.redirect('/auth/login');
    }

    // Render register page
    getRegister(req, res) {
        res.render('register', { error: null });
    }

    // Handle register form submission
    async postRegister(req, res) {
        try {
            const { name, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await this.userModel.findByEmail(email);
            if (existingUser) {
                return res.render('register', {
                    error: 'Email already registered'
                });
            }

            // Create new user
            await this.userModel.createUser({ name, email, password, role });

            res.redirect('/auth/login');
        } catch (error) {
            console.error('Registration error:', error);
            res.render('register', {
                error: 'An error occurred during registration'
            });
        }
    }
}

module.exports = AuthController; 