const Student = require('../models/Student');

class StudentController {
    constructor(db) {
        this.studentModel = new Student(db);
    }

    async getDashboard(req, res) {
        try {
            const studentId = req.user.id;
            const assignments = await this.studentModel.getAssignments(studentId);
            const performanceData = await this.studentModel.getPerformanceData(studentId);

            res.render('student/dashboard', {
                assignments,
                performanceData
            });
        } catch (error) {
            console.error('Error in student dashboard:', error);
            res.status(500).render('error', { message: 'Error loading dashboard' });
        }
    }

    async getSubmitAssignment(req, res) {
        try {
            const studentId = req.user.id;
            const assignments = await this.studentModel.getAssignments(studentId);

            res.render('student/submit-assignment', {
                assignments: assignments.filter(a => !a.status)
            });
        } catch (error) {
            console.error('Error in submit assignment page:', error);
            res.status(500).render('error', { message: 'Error loading submit assignment page' });
        }
    }
}

module.exports = StudentController; 