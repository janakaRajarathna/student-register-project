const Lecturer = require('../models/Lecturer');
const path = require('path');
const fs = require('fs').promises;

class LecturerController {
    constructor(db) {
        this.db = db;
        this.Assignment = require('../models/Assignment');
        this.assignmentModel = new this.Assignment(db);
        this.lecturerModel = new Lecturer(db);
        this.submissionsDir = path.join(__dirname, '../uploads/submissions');
    }

    // Render lecturer dashboard
    async getDashboard(req, res) {
        try {
            const lecturerId = req.session.user ? req.session.user.id : req.user.id;
            const submissions = await this.lecturerModel.getSubmissionsToGrade(lecturerId);
            let performance = await this.lecturerModel.getClassPerformance(lecturerId);
            if (!Array.isArray(performance)) performance = [];
            const assignmentsResult = await this.assignmentModel.getByLecturer(lecturerId);
            const assignments = assignmentsResult.success ? assignmentsResult.assignments : [];

            // Get subjects for the lecturer
            const [subjects] = await this.db.execute(`
                SELECT id, name 
                FROM subjects 
                WHERE lecturer_id = ?
                ORDER BY name
            `, [lecturerId]);

            res.render('lecturer/dashboard', {
                user: req.session.user,
                submissions,
                performance,
                assignments,
                subjects
            });
        } catch (error) {
            console.error('Error in lecturer dashboard:', error);
            res.status(500).render('error', {
                message: 'Error loading dashboard'
            });
        }
    }

    // Create new assignment
    async createAssignment(req, res) {
        try {
            const { title, description, deadline, maxMarks, subjectId } = req.body;
            const createdBy = req.session.user ? req.session.user.id : req.user.id;

            const result = await this.assignmentModel.create({
                title,
                description,
                deadline,
                maxMarks,
                createdBy,
                subjectId
            });

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Assignment created successfully',
                    assignmentId: result.assignmentId
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message || 'Failed to create assignment'
                });
            }
        } catch (error) {
            console.error('Error in createAssignment:', error);
            // Log the full error details
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                body: req.body,
                user: req.user
            });
            res.status(500).json({
                success: false,
                message: 'An error occurred while creating the assignment'
            });
        }
    }

    // Get all assignments for the lecturer
    async getAssignments(req, res) {
        try {
            const createdBy = req.session.user ? req.session.user.id : req.user.id;
            const result = await this.assignmentModel.getByLecturer(createdBy);

            if (result.success) {
                res.json({
                    success: true,
                    assignments: result.assignments
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message || 'Failed to fetch assignments'
                });
            }
        } catch (error) {
            console.error('Error in getAssignments:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching assignments'
            });
        }
    }

    // Get a single assignment
    async getAssignment(req, res) {
        try {
            const assignmentId = req.params.id;
            const createdBy = req.user.id;

            const result = await this.assignmentModel.getById(assignmentId, createdBy);

            if (result.success) {
                res.json({
                    success: true,
                    assignment: result.assignment
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message || 'Failed to fetch assignment'
                });
            }
        } catch (error) {
            console.error('Error in getAssignment:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching the assignment'
            });
        }
    }

    // Update an assignment
    async updateAssignment(req, res) {
        try {
            const assignmentId = req.params.id;
            const createdBy = req.session.user ? req.session.user.id : req.user.id;
            const { title, description, deadline, maxMarks, subjectId } = req.body;

            const result = await this.assignmentModel.update(assignmentId, createdBy, {
                title,
                description,
                deadline,
                maxMarks,
                subjectId
            });

            if (result.success) {
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message || 'Failed to update assignment'
                });
            }
        } catch (error) {
            console.error('Error in updateAssignment:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while updating the assignment'
            });
        }
    }

    // Delete an assignment
    async deleteAssignment(req, res) {
        try {
            const assignmentId = req.params.id;
            const createdBy = req.user.id;

            const result = await this.assignmentModel.delete(assignmentId, createdBy);

            if (result.success) {
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message || 'Failed to delete assignment'
                });
            }
        } catch (error) {
            console.error('Error in deleteAssignment:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while deleting the assignment'
            });
        }
    }

    // Get submission preview
    async getSubmissionPreview(req, res) {
        try {
            const submissionId = req.params.id;
            const lecturerId = req.session.user ? req.session.user.id : req.user.id;

            const submission = await this.lecturerModel.getSubmissionById(submissionId, lecturerId);

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Submission not found or you do not have permission to view it'
                });
            }

            if (!submission.assignment_file) {
                return res.status(404).json({
                    success: false,
                    message: 'No file content found for this submission'
                });
            }

            // Convert the file content to base64 for preview
            const base64Content = submission.assignment_file.toString('base64');

            // Since we don't store file type, we'll determine it from the content
            // For now, we'll assume it's a PDF if it starts with %PDF, otherwise treat as text
            const fileType = submission.assignment_file.toString().startsWith('%PDF') ? 'pdf' : 'txt';

            res.json({
                success: true,
                fileType: fileType,
                fileContent: base64Content,
                fileName: `submission_${submissionId}`
            });
        } catch (error) {
            console.error('Error in getSubmissionPreview:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving file preview'
            });
        }
    }

    // Submit grade for a submission
    async submitGrade(req, res) {
        try {
            const { submissionId, grade, feedback } = req.body;
            const lecturerId = req.session.user ? req.session.user.id : req.user.id;

            if (!submissionId || !grade || !feedback) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            const success = await this.lecturerModel.submitGrade(submissionId, lecturerId, grade, feedback);

            if (success) {
                res.json({
                    success: true,
                    message: 'Grade submitted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Submission not found or you do not have permission to grade it'
                });
            }
        } catch (error) {
            console.error('Error in submitGrade:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting grade'
            });
        }
    }

    // Get performance for a single assignment
    async getAssignmentPerformance(req, res) {
        try {
            const lecturerId = req.session.user ? req.session.user.id : req.user.id;
            const assignmentId = req.params.assignmentId;
            const performance = await this.lecturerModel.getAssignmentPerformance(lecturerId, assignmentId);
            res.json({ success: true, performance });
        } catch (error) {
            console.error('Error fetching assignment performance:', error);
            res.status(500).json({ success: false, message: 'Error fetching performance data' });
        }
    }

    // Get grade distribution for a single assignment
    async getGradeDistribution(req, res) {
        try {
            const assignmentId = req.params.assignmentId;
            const distribution = await this.lecturerModel.getGradeDistribution(assignmentId);
            res.json({ success: true, distribution });
        } catch (error) {
            console.error('Error fetching grade distribution:', error);
            res.status(500).json({ success: false, message: 'Error fetching grade distribution' });
        }
    }

    // Get subjects for the logged-in lecturer
    async getSubjects(req, res) {
        try {
            const lecturerId = req.user.id;
            const [subjects] = await this.db.execute(`
                SELECT id, name 
                FROM subjects 
                WHERE lecturer_id = ?
                ORDER BY name
            `, [lecturerId]);

            res.json({
                success: true,
                subjects
            });
        } catch (error) {
            console.error('Error in getSubjects:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching subjects'
            });
        }
    }

    // Render assignments page
    async getAssignmentsPage(req, res) {
        try {
            const lecturerId = req.session.user ? req.session.user.id : req.user.id;

            // Get subjects for the lecturer
            const [subjects] = await this.db.execute(`
                SELECT id, name 
                FROM subjects 
                WHERE lecturer_id = ?
                ORDER BY name
            `, [lecturerId]);

            res.render('lecturer/assignments', {
                user: req.session.user,
                subjects
            });
        } catch (error) {
            console.error('Error in getAssignmentsPage:', error);
            res.status(500).render('error', {
                message: 'Error loading assignments page'
            });
        }
    }
}

module.exports = LecturerController; 
