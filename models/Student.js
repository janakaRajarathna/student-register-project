class Student {
    constructor(db) {
        this.db = db;
    }

    async getAssignments(studentId) {
        try {
            const [assignments] = await this.db.execute(`
                SELECT 
                    a.id,
                    a.title,
                    a.description,
                    a.deadline,
                    s.status,
                    g.grade
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
                LEFT JOIN grades g ON s.id = g.submission_id
                ORDER BY a.deadline ASC
            `, [studentId]);
            return assignments;
        } catch (error) {
            console.error('Error fetching student assignments:', error);
            throw error;
        }
    }

    async getPerformanceData(studentId) {
        try {
            const [performance] = await this.db.execute(`
                SELECT 
                    a.title,
                    g.grade,
                    g.feedback
                FROM grades g
                JOIN submissions s ON g.submission_id = s.id
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.student_id = ?
                ORDER BY g.created_at DESC
            `, [studentId]);
            return performance;
        } catch (error) {
            console.error('Error fetching student performance:', error);
            throw error;
        }
    }

    async submitAssignment({ assignmentId, studentId, filePath, comments }) {
        try {
            // Check if submission already exists
            const [existingSubmission] = await this.db.execute(
                'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?',
                [assignmentId, studentId]
            );

            if (existingSubmission.length > 0) {
                throw new Error('You have already submitted this assignment');
            }

            // Check if assignment deadline has passed
            const [assignment] = await this.db.execute(
                'SELECT deadline FROM assignments WHERE id = ?',
                [assignmentId]
            );

            if (!assignment.length) {
                throw new Error('Assignment not found');
            }

            const deadline = new Date(assignment[0].deadline);
            const now = new Date();

            if (now > deadline) {
                throw new Error('Assignment deadline has passed');
            }

            // Insert new submission
            const [result] = await this.db.execute(
                `INSERT INTO submissions 
                (assignment_id, student_id, assignment_file, student_comment, status) 
                VALUES (?, ?, ?, ?, 'PENDING')`,
                [assignmentId, studentId, filePath, comments]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error submitting assignment:', error);
            throw error;
        }
    }
}

module.exports = Student; 