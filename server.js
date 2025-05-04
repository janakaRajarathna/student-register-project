const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();

// Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'assignment_system'
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Middleware
app.use(async (req, res, next) => {
  try {
    req.db = await mysql.createConnection(dbConfig);
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send('Database connection error');
  }
});

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