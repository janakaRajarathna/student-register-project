class LecturerController {
    constructor(db) {
        this.db = db;
        this.Assignment = require('../models/Assignment');
        this.assignmentModel = new this.Assignment(db);
    }

    // Render lecturer dashboard
    getDashboard(req, res) {
        // Pass the user object from the JWT token to the view
        res.render('lecturer/dashboard', { user: req.user });
    }

    // Create new assignment
    async createAssignment(req, res) {
        try {
            const { title, description, deadline, maxMarks } = req.body;
            const createdBy = req.user.id;

            const result = await this.assignmentModel.create({
                title,
                description,
                deadline,
                maxMarks,
                createdBy
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
            res.status(500).json({
                success: false,
                message: 'An error occurred while creating the assignment'
            });
        }
    }

    // Get all assignments for the lecturer
    async getAssignments(req, res) {
        try {
            const createdBy = req.user.id;
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
            const createdBy = req.user.id;
            const { title, description, deadline, maxMarks } = req.body;

            const result = await this.assignmentModel.update(assignmentId, createdBy, {
                title,
                description,
                deadline,
                maxMarks
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
}

module.exports = LecturerController; 