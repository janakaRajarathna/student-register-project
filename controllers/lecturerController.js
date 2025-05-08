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
}

module.exports = LecturerController; 