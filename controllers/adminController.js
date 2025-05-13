class AdminController {
    constructor(db) {
        this.db = db;
    }

    async getDashboard(req, res) {
        try {
            // Get total users count
            const [totalUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users');

            // Get total lecturers count
            const [totalLecturers] = await this.db.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "lecturer"'
            );

            // Get total students count
            const [totalStudents] = await this.db.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "student"'
            );

            // Get total assignments count
            const [totalAssignments] = await this.db.execute('SELECT COUNT(*) as count FROM assignments');

            // Get recent activity (last 5 submissions)
            const [recentActivity] = await this.db.execute(`
                SELECT 
                    s.submitted_at as timestamp,
                    CONCAT(u.name, ' submitted assignment: ', a.title) as description
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                JOIN assignments a ON s.assignment_id = a.id
                ORDER BY s.submitted_at DESC
                LIMIT 5
            `);

            res.render('admin/dashboard', {
                user: req.session.user,
                stats: {
                    totalUsers: totalUsers[0].count,
                    totalLecturers: totalLecturers[0].count,
                    totalStudents: totalStudents[0].count,
                    totalAssignments: totalAssignments[0].count
                },
                recentActivity: recentActivity
            });
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            res.status(500).render('error', {
                message: 'Error loading dashboard',
                error: error
            });
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

    async getSubjects(req, res) {
        try {
            const [subjects] = await this.db.execute(`
                SELECT s.*, u.name as lecturer_name 
                FROM subjects s
                LEFT JOIN users u ON s.lecturer_id = u.id
                ORDER BY s.name
            `);
            res.render('admin/subjects', { subjects });
        } catch (error) {
            console.error('Error loading subjects:', error);
            res.status(500).render('error', {
                message: 'Error loading subjects',
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