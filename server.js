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
const AuthController = require('./controllers/authController');
const AuthMiddleware = require('./middleware/authMiddleware');
const StudentController = require('./controllers/studentController');
const lecturerRoutes = require('./routes/lecturerRoutes');
const LecturerController = require('./controllers/lecturerController');

// Ensure required environment variables exist
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-123';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_NAME = process.env.DB_NAME || 'assignment_system';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database Configuration
const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
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
app.use('/', mainRoutes);

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await req.db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role
    };

    res.json({ success: true, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Subject Selection
app.get('/api/subjects', async (req, res) => {
  try {
    const [subjects] = await req.db.execute(`
      SELECT s.id, s.name, u.name AS lecturer 
      FROM subjects s
      JOIN users u ON s.lecturer_id = u.id
    `);
    res.json(subjects);
  } catch (error) {
    console.error('Subjects error:', error);
    res.status(500).json({ error: 'Failed to load subjects' });
  }
});

app.post('/api/select-subject', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  req.session.subjectId = req.body.subjectId;
  res.json({ success: true });
});

// Assignment Management
app.post('/api/assignments', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'lecturer') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { title, description, deadline } = req.body;
    const [result] = await req.db.execute(
      'INSERT INTO assignments (title, description, deadline, lecturer_id) VALUES (?, ?, ?, ?)',
      [title, description, deadline, req.session.user.id]
    );

    res.json({ success: true, assignmentId: result.insertId });
  } catch (error) {
    console.error('Assignment creation error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// File Submission
app.post('/api/submit', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const fileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(__dirname, 'public', 'uploads', fileName);

    await file.mv(uploadPath);

    const [result] = await req.db.execute(
      'INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)',
      [req.body.assignmentId, req.session.user.id, fileName]
    );

    res.json({ success: true, submissionId: result.insertId });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Grading System
app.post('/api/grade', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'lecturer') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { submissionId, grade, feedback } = req.body;
    await req.db.execute(
      'INSERT INTO grades (submission_id, grade, feedback, graded_by) VALUES (?, ?, ?, ?)',
      [submissionId, grade, feedback, req.session.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ error: 'Grading failed' });
  }
});

// Analytics Endpoints
app.get('/api/performance', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const query = req.session.user.role === 'student' ? `
      SELECT a.title, g.grade 
      FROM grades g
      JOIN submissions s ON g.submission_id = s.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ?
    ` : `
      SELECT AVG(grade) as average, MAX(grade) as max, MIN(grade) as min
      FROM grades
      JOIN submissions ON grades.submission_id = submissions.id
      WHERE submissions.assignment_id IN (
        SELECT id FROM assignments WHERE lecturer_id = ?
      )
    `;

    const [results] = await req.db.execute(query, [req.session.user.id]);
    res.json(results);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.log('error middleware called >>>');
//   console.log('error:', err);

//   // Ensure error object has required properties
//   const errorObj = {
//     status: err.status || 500,
//     message: err.message || 'Internal Server Error',
//     description: err.description || 'An unexpected error occurred',
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   };

//   // If it's a database error, add more user-friendly message
//   if (err.code === 'ER_NO_SUCH_TABLE') {
//     errorObj.description = 'Database table not found. Please contact the administrator.';
//   }

//   res.status(errorObj.status);
//   res.render('error', {
//     error: errorObj,
//     user: req.session.user || null // Pass user object if available
//   });
// });

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