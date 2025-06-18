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
                    status = 'MARKED'
                WHERE id = ?
            `, [grade, feedback, lecturerId, submissionId]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in submitGrade:', error);
            throw error;
        }
    }

    async getAssignmentPerformance(lecturerId, assignmentId) {
        try {
            const [rows] = await this.db.query(`
                SELECT 
                    a.id as assignment_id,
                    a.title as assignment_title,
                    COUNT(s.id) as total_submissions,
                    AVG(s.marks) as average_marks,
                    MIN(s.marks) as min_marks,
                    MAX(s.marks) as max_marks
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id
                WHERE a.created_by = ? AND a.id = ? AND s.status = 'GRADED'
                GROUP BY a.id, a.title
            `, [lecturerId, assignmentId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in getAssignmentPerformance:', error);
            throw error;
        }
    }

    async getGradeDistribution(assignmentId) {
        try {
            const [rows] = await this.db.query(`
                SELECT
                    SUM(CASE WHEN marks >= 80 THEN 1 ELSE 0 END) AS A,
                    SUM(CASE WHEN marks >= 70 AND marks < 80 THEN 1 ELSE 0 END) AS B,
                    SUM(CASE WHEN marks >= 60 AND marks < 70 THEN 1 ELSE 0 END) AS C,
                    SUM(CASE WHEN marks >= 50 AND marks < 60 THEN 1 ELSE 0 END) AS D,
                    SUM(CASE WHEN marks < 50 THEN 1 ELSE 0 END) AS F
                FROM submissions
                WHERE assignment_id = ? AND status = 'MARKED'
            `, [assignmentId]);
            return rows[0] || { A: 0, B: 0, C: 0, D: 0, F: 0 };
        } catch (error) {
            console.error('Error in getGradeDistribution:', error);
            throw error;
        }
    }

    async getStudentsForLecturer(lecturerId) {
        try {
            const [students] = await this.db.query(`
                SELECT DISTINCT
                    u.id,
                    u.full_name,
                    u.username
                FROM users u
                JOIN submissions s ON u.id = s.student_id
                JOIN assignments a ON s.assignment_id = a.id
                WHERE a.created_by = ? AND u.role = 'student'
                ORDER BY u.full_name
            `, [lecturerId]);
            return students;
        } catch (error) {
            console.error('Error in getStudentsForLecturer:', error);
            throw error;
        }
    }

    async getStudentPerformance(lecturerId, studentId) {
        try {
            const [performance] = await this.db.query(`
                SELECT 
                    a.id as assignment_id,
                    a.title as assignment_title,
                    a.max_marks,
                    s.marks,
                    s.submitted_at,
                    ROUND((s.marks / a.max_marks) * 100, 2) as percentage
                FROM assignments a
                JOIN submissions s ON a.id = s.assignment_id
                WHERE a.created_by = ? AND s.student_id = ? AND s.status = 'MARKED'
                ORDER BY a.deadline ASC
            `, [lecturerId, studentId]);
            return performance;
        } catch (error) {
            console.error('Error in getStudentPerformance:', error);
            throw error;
        }
    }
}

module.exports = Lecturer; 