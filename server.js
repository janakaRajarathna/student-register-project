require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import routes and controllers
const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const AuthController = require('./controllers/authController');
const AuthMiddleware = require('./middleware/authMiddleware');
const StudentController = require('./controllers/studentController');
const AdminController = require('./controllers/adminController');
const lecturerRoutes = require('./routes/lecturerRoutes');
const LecturerController = require('./controllers/lecturerController');

// Ensure required environment variables exist
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-123';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_NAME = process.env.DB_NAME || 'assignment_system';
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_PORT = process.env.DB_PORT || 3306;

// Database Configuration
const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(fileUpload());

// Add middleware to pass user data to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Static files configuration
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Template Engine Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize auth middleware and controller
const authMiddleware = new AuthMiddleware(JWT_SECRET);

// Database Connection Middleware
app.use(async (req, res, next) => {
  try {
    const db = await mysql.createConnection(dbConfig);
    req.db = db;
    req.authController = new AuthController(db);
    req.studentController = new StudentController(db);
    req.lecturerController = new LecturerController(db);
    req.adminController = new AdminController(db);
    req.authMiddleware = authMiddleware;
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send('Database connection error');
  }
});

// Apply auth middleware to protected routes
app.use('/dashboard', (req, res, next) => req.authMiddleware.requireAuth(req, res, next));
app.use('/admin', (req, res, next) => {
  req.authMiddleware.requireAuth(req, res, () => {
    req.authMiddleware.checkRole(['admin'])(req, res, next);
  });
});
app.use('/lecturer', (req, res, next) => {
  req.authMiddleware.requireAuth(req, res, () => {
    req.authMiddleware.checkRole(['lecturer'])(req, res, next);
  });
});
app.use('/student', (req, res, next) => {
  req.authMiddleware.requireAuth(req, res, () => {
    req.authMiddleware.checkRole(['student'])(req, res, next);
  });
});

// Route Middleware
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/lecturer', lecturerRoutes);
app.use('/admin', adminRoutes);
app.use('/', mainRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Get assignments (for student submission dropdown)
app.get('/api/assignments', async (req, res) => {
  try {
    const [assignments] = await req.db.execute(`
      SELECT * FROM assignments 
      WHERE deadline > NOW()
      ORDER BY deadline ASC
    `);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load assignments' });
  }
});

// Get submissions (for lecturer grading)
app.get('/api/submissions', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'lecturer') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const [submissions] = await req.db.execute(`
      SELECT s.id, u.name as student_name, a.title, s.submission_date, g.grade
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      LEFT JOIN grades g ON s.id = g.submission_id
      WHERE a.lecturer_id = ?
    `, [req.session.user.id]);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});

// Root route: redirect to login if not logged in, else to dashboard
app.get('/', (req, res) => {
  console.log('come here')
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role === 'student') {
    return res.redirect('/student/dashboard');
  } else if (req.session.user.role === 'lecturer') {
    return res.redirect('/lecturer/dashboard');
  } else if (req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/auth/login');
});