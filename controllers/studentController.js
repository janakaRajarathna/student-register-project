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
            const performance = await this.studentModel.getPerformanceData(studentId);

            res.render('student/dashboard', {
                assignments,
                performance,
                user: req.session.user
            });
        } catch (error) {
            console.error('Error in getDashboard:', error);
            res.status(500).render('error', {
                message: 'Error loading dashboard',
                error: error
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
            const fileType = file.mimetype || '';

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

            // Save submission to database with file data and file type
            await this.studentModel.submitAssignment({
                assignmentId,
                studentId,
                fileData,
                comments,
                fileType
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

    // Get submission preview
    async getSubmissionPreview(req, res) {
        try {
            const submissionId = req.params.id;
            const studentId = req.session.user.id;

            const submission = await this.studentModel.getSubmissionById(submissionId, studentId);

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Submission not found'
                });
            }

            if (!submission.assignment_file) {
                return res.status(404).json({
                    success: false,
                    message: 'No file found for this submission'
                });
            }

            // Convert file content to base64 for preview
            const base64Content = submission.assignment_file.toString('base64');

            res.json({
                success: true,
                assignment_title: submission.assignment_title,
                submission_date: submission.submitted_at,
                status: submission.status,
                student_comment: submission.student_comment,
                grade: submission.marks,
                feedback: submission.feedback,
                file_content: base64Content,
                file_type: submission.file_type || 'application/pdf',
                file_name: submission.file_name || 'submission'
            });
        } catch (error) {
            console.error('Error in getSubmissionPreview:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving submission preview'
            });
        }
    }
}

module.exports = StudentController; 