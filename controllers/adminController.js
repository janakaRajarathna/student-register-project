const bcrypt = require('bcryptjs');

class AdminController {
    constructor(db) {
        this.db = db;
    }

    async getDashboard(req, res) {
        try {
            // Get counts for dashboard stats
            const [totalStudents] = await this.db.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = ?',
                ['student']
            );

            const [totalLecturers] = await this.db.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = ?',
                ['lecturer']
            );

            const [totalSubjects] = await this.db.execute(
                'SELECT COUNT(*) as count FROM subjects'
            );

            const [totalAssignments] = await this.db.execute(
                'SELECT COUNT(*) as count FROM assignments'
            );

            // Get recent activity
            const [recentActivity] = await this.db.execute(`
                SELECT 
                    'assignment_created' as type,
                    a.title as description,
                    a.created_at as timestamp
                FROM assignments a
                UNION ALL
                SELECT 
                    'submission_made' as type,
                    CONCAT('New submission for ', a.title) as description,
                    s.submitted_at as timestamp
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                ORDER BY timestamp DESC
                LIMIT 10
            `);

            // Get lecturers for subject creation
            const [lecturers] = await this.db.execute(
                'SELECT id, full_name FROM users WHERE role = ?',
                ['lecturer']
            );

            res.render('admin/dashboard', {
                user: req.session.user,
                stats: {
                    totalStudents: totalStudents[0].count,
                    totalLecturers: totalLecturers[0].count,
                    totalSubjects: totalSubjects[0].count,
                    totalAssignments: totalAssignments[0].count
                },
                recentActivity,
                lecturers
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).send('Error loading dashboard');
        }
    }

    async createSubject(req, res) {
        try {
            const { name, lecturer_id } = req.body;

            // Validate input
            if (!name || !lecturer_id) {
                return res.status(400).json({ error: 'Name and lecturer are required' });
            }

            // Check if lecturer exists
            const [lecturer] = await this.db.execute(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [lecturer_id, 'lecturer']
            );

            if (!lecturer.length) {
                return res.status(400).json({ error: 'Invalid lecturer' });
            }

            // Check if subject with same name and lecturer already exists
            const [existingSubject] = await this.db.execute(
                'SELECT id FROM subjects WHERE name = ? AND lecturer_id = ?',
                [name, lecturer_id]
            );

            if (existingSubject.length > 0) {
                return res.status(400).json({ error: 'A subject with this name is already assigned to this lecturer' });
            }

            // Create subject
            const [result] = await this.db.execute(
                'INSERT INTO subjects (name, lecturer_id) VALUES (?, ?)',
                [name, lecturer_id]
            );

            res.json({ success: true, subjectId: result.insertId });
        } catch (error) {
            console.error('Create subject error:', error);
            res.status(500).json({ error: 'Error creating subject' });
        }
    }

    async getSubjects(req, res) {
        try {
            // Get all subjects with lecturer names
            const [subjects] = await this.db.execute(`
                SELECT s.*, u.full_name as lecturer_name
                FROM subjects s
                LEFT JOIN users u ON s.lecturer_id = u.id
                ORDER BY s.name
            `);

            // Get all lecturers for the dropdown
            const [lecturers] = await this.db.execute(
                'SELECT id, full_name FROM users WHERE role = ?',
                ['lecturer']
            );

            res.render('admin/subjects', {
                user: req.session.user,
                subjects,
                lecturers
            });
        } catch (error) {
            console.error('Get subjects error:', error);
            res.status(500).send('Error loading subjects');
        }
    }

    async updateSubject(req, res) {
        try {
            const { id } = req.params;
            const { name, lecturer_id } = req.body;

            // Validate input
            if (!name || !lecturer_id) {
                return res.status(400).json({ error: 'Name and lecturer are required' });
            }

            // Check if subject exists
            const [subject] = await this.db.execute(
                'SELECT id FROM subjects WHERE id = ?',
                [id]
            );

            if (!subject.length) {
                return res.status(404).json({ error: 'Subject not found' });
            }

            // Check if lecturer exists
            const [lecturer] = await this.db.execute(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [lecturer_id, 'lecturer']
            );

            if (!lecturer.length) {
                return res.status(400).json({ error: 'Invalid lecturer' });
            }

            // Check if subject with same name and lecturer already exists (excluding current subject)
            const [existingSubject] = await this.db.execute(
                'SELECT id FROM subjects WHERE name = ? AND lecturer_id = ? AND id != ?',
                [name, lecturer_id, id]
            );

            if (existingSubject.length > 0) {
                return res.status(400).json({ error: 'A subject with this name is already assigned to this lecturer' });
            }

            // Update subject
            await this.db.execute(
                'UPDATE subjects SET name = ?, lecturer_id = ? WHERE id = ?',
                [name, lecturer_id, id]
            );

            res.json({ success: true });
        } catch (error) {
            console.error('Update subject error:', error);
            res.status(500).json({ error: 'Error updating subject' });
        }
    }

    async deleteSubject(req, res) {
        try {
            const { id } = req.params;

            // Check if subject exists
            const [subject] = await this.db.execute(
                'SELECT id FROM subjects WHERE id = ?',
                [id]
            );

            if (!subject.length) {
                return res.status(404).json({ error: 'Subject not found' });
            }

            // Check if subject has any assignments
            const [assignments] = await this.db.execute(
                'SELECT id FROM assignments WHERE subject_id = ?',
                [id]
            );

            if (assignments.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete subject with existing assignments'
                });
            }

            // Delete subject
            await this.db.execute(
                'DELETE FROM subjects WHERE id = ?',
                [id]
            );

            res.json({ success: true });
        } catch (error) {
            console.error('Delete subject error:', error);
            res.status(500).json({ error: 'Error deleting subject' });
        }
    }

    async getUsers(req, res) {
        try {
            const [users] = await this.db.execute('SELECT * FROM users ORDER BY name');
            res.render('admin/users', { users });
        } catch (error) {
            console.error('Error loading users:', error);
            res.status(500).render('error', {
                message: 'Error loading users',
                error: error
            });
        }
    }

    async getAssignments(req, res) {
        try {
            const [assignments] = await this.db.execute(`
                SELECT a.*, u.name as lecturer_name 
                FROM assignments a
                LEFT JOIN users u ON a.lecturer_id = u.id
                ORDER BY a.deadline DESC
            `);
            res.render('admin/assignments', { assignments });
        } catch (error) {
            console.error('Error loading assignments:', error);
            res.status(500).render('error', {
                message: 'Error loading assignments',
                error: error
            });
        }
    }
}

module.exports = AdminController; 