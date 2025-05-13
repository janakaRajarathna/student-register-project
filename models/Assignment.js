class Assignment {
    constructor(db) {
        this.db = db;
    }

    async create(assignmentData) {
        try {
            const { title, description, deadline, maxMarks, createdBy, subjectId } = assignmentData;

            // Log the values being passed
            console.log('Assignment creation values:', {
                title,
                description,
                deadline,
                maxMarks,
                createdBy,
                subjectId
            });

            const query = `
                INSERT INTO assignments (title, description, deadline, max_marks, created_by, subject_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;

            // Log the query parameters array
            const queryParams = [
                title,
                description,
                deadline,
                maxMarks,
                createdBy,
                subjectId
            ];

            const [result] = await this.db.execute(query, queryParams);

            return {
                success: true,
                assignmentId: result.insertId
            };
        } catch (error) {
            console.error('Error creating assignment:', error);
            // Log the full error details
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                assignmentData
            });
            return {
                success: false,
                message: 'Failed to create assignment'
            };
        }
    }

    async getByLecturer(createdBy) {
        try {
            const query = `
                SELECT * FROM assignments 
                WHERE created_by = ? 
                ORDER BY created_at DESC
            `;

            const [assignments] = await this.db.execute(query, [createdBy]);

            return {
                success: true,
                assignments
            };
        } catch (error) {
            console.error('Error fetching assignments:', error);
            return {
                success: false,
                message: 'Failed to fetch assignments'
            };
        }
    }

    async getById(assignmentId, createdBy) {
        try {
            const query = `
                SELECT * FROM assignments 
                WHERE id = ? AND created_by = ?
            `;

            const [assignments] = await this.db.execute(query, [assignmentId, createdBy]);

            if (assignments.length === 0) {
                return {
                    success: false,
                    message: 'Assignment not found or unauthorized'
                };
            }

            return {
                success: true,
                assignment: assignments[0]
            };
        } catch (error) {
            console.error('Error fetching assignment:', error);
            return {
                success: false,
                message: 'Failed to fetch assignment'
            };
        }
    }

    async update(assignmentId, createdBy, assignmentData) {
        try {
            // First check if the assignment belongs to the lecturer
            const [assignments] = await this.db.execute(
                'SELECT id FROM assignments WHERE id = ? AND created_by = ?',
                [assignmentId, createdBy]
            );

            if (assignments.length === 0) {
                return {
                    success: false,
                    message: 'Assignment not found or unauthorized'
                };
            }

            const { title, description, deadline, maxMarks, subjectId } = assignmentData;

            // Update the assignment
            await this.db.execute(
                `UPDATE assignments 
                SET title = ?, description = ?, deadline = ?, max_marks = ?, subject_id = ?
                WHERE id = ?`,
                [title, description, deadline, maxMarks, subjectId, assignmentId]
            );

            return {
                success: true,
                message: 'Assignment updated successfully'
            };
        } catch (error) {
            console.error('Error updating assignment:', error);
            return {
                success: false,
                message: 'Failed to update assignment'
            };
        }
    }

    async delete(assignmentId, createdBy) {
        try {
            // First check if the assignment belongs to the lecturer
            const [assignments] = await this.db.execute(
                'SELECT id FROM assignments WHERE id = ? AND created_by = ?',
                [assignmentId, createdBy]
            );

            if (assignments.length === 0) {
                return {
                    success: false,
                    message: 'Assignment not found or unauthorized'
                };
            }

            // Delete the assignment
            await this.db.execute(
                'DELETE FROM assignments WHERE id = ?',
                [assignmentId]
            );

            return {
                success: true,
                message: 'Assignment deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return {
                success: false,
                message: 'Failed to delete assignment'
            };
        }
    }
}

module.exports = Assignment; 