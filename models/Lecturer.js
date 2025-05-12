class Lecturer {
    constructor(db) {
        this.db = db;
    }

    async getSubmissionsToGrade(lecturerId) {
        try {
            const [submissions] = await this.db.query(`
                SELECT 
                    s.id as submission_id,
                    s.submitted_at,
                    s.student_comment,
                    s.status,
                    s.marks,
                    s.feedback,
                    a.id as assignment_id,
                    a.title as assignment_title,
                    a.deadline,
                    u.id as student_id,
                    u.username as student_name,
                    s.assignment_file
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN users u ON s.student_id = u.id
                WHERE a.created_by = ? AND s.status = 'PENDING'
                ORDER BY s.submitted_at DESC
            `, [lecturerId]);

            return submissions;
        } catch (error) {
            console.error('Error in getSubmissionsToGrade:', error);
            throw error;
        }
    }

    async getClassPerformance(lecturerId) {
        try {
            const [performance] = await this.db.query(`
                SELECT 
                    a.id as assignment_id,
                    a.title as assignment_title,
                    COUNT(s.id) as total_submissions,
                    AVG(s.marks) as average_marks,
                    MIN(s.marks) as min_marks,
                    MAX(s.marks) as max_marks
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id
                WHERE a.created_by = ? AND s.status = 'GRADED'
                GROUP BY a.id, a.title
                ORDER BY a.deadline DESC
            `, [lecturerId]);

            return performance;
        } catch (error) {
            console.error('Error in getClassPerformance:', error);
            throw error;
        }
    }

    async getSubmissionById(submissionId, lecturerId) {
        try {
            const [submissions] = await this.db.query(`
                SELECT 
                    s.*,
                    a.title as assignment_title,
                    u.username as student_name,
                    s.assignment_file
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN users u ON s.student_id = u.id
                WHERE s.id = ? AND a.created_by = ?
            `, [submissionId, lecturerId]);

            return submissions[0];
        } catch (error) {
            console.error('Error in getSubmissionById:', error);
            throw error;
        }
    }

    async submitGrade(submissionId, lecturerId, grade, feedback) {
        try {
            const [result] = await this.db.query(`
                UPDATE submissions 
                SET marks = ?,
                    feedback = ?,
                    marked_by = ?,
                    marked_at = CURRENT_TIMESTAMP,
                    status = 'GRADED'
                WHERE id = ?
            `, [grade, feedback, lecturerId, submissionId]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in submitGrade:', error);
            throw error;
        }
    }
}

module.exports = Lecturer; 