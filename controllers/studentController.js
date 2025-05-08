const Student = require('../models/Student');
const path = require('path');

class StudentController {
    constructor(db) {
        this.studentModel = new Student(db);
    }

    async getDashboard(req, res) {
        try {
            const studentId = req.session.user.id;
            const assignments = await this.studentModel.getAssignments(studentId);
            const performanceData = await this.studentModel.getPerformanceData(studentId);

            res.render('student/dashboard', {
                assignments,
                performanceData
            });
        } catch (error) {
            console.error('Error in student dashboard:', error);
            res.status(500).render('error', {
                message: 'Error loading dashboard'
            });
        }
    }

    async getSubmitAssignment(req, res) {
        try {
            const studentId = req.session.user.id;
            const assignments = await this.studentModel.getAssignments(studentId);

            res.render('student/submit-assignment', {
                assignments: assignments.filter(a => !a.status)
            });
        } catch (error) {
            console.error('Error in submit assignment page:', error);
            res.status(500).render('error', {
                message: 'Error loading submit assignment page'
            });
        }
    }

    async submitAssignment(req, res) {
        try {
            if (!req.files || !req.files.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const file = req.files.file;
            const assignmentId = req.body.assignmentId;
            const studentId = req.session.user.id;
            const comments = req.body.comments || '';

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: 'File size exceeds 10MB limit'
                });
            }

            // Validate file type
            const allowedTypes = ['.pdf', '.doc', '.docx', '.zip'];
            const fileExt = path.extname(file.name).toLowerCase();
            if (!allowedTypes.includes(fileExt)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type. Allowed types: PDF, DOC, DOCX, ZIP'
                });
            }

            // Get file data as buffer
            const fileData = file.data;

            // Save submission to database with file data
            await this.studentModel.submitAssignment({
                assignmentId,
                studentId,
                fileData,
                comments
            });

            res.json({
                success: true,
                message: 'Assignment submitted successfully!'
            });
        } catch (error) {
            console.error('Error submitting assignment:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error submitting assignment'
            });
        }
    }
}

module.exports = StudentController; 