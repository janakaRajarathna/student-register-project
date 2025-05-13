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
                    s.id as submission_id,
                    s.status,
                    s.marks as grade,
                    s.feedback,
                    s.student_comment,
                    s.submitted_at,
                    sub.name as subject_name
                FROM assignments a
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
                LEFT JOIN subjects sub ON a.subject_id = sub.id
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
                    s.marks as grade,
                    s.feedback,
                    a.subject_id,
                    sub.name as subject_name
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                LEFT JOIN subjects sub ON a.subject_id = sub.id
                WHERE s.student_id = ? AND s.status = 'MARKED'
                ORDER BY a.due_date ASC
            `, [studentId]);
            return performance;
        } catch (error) {
            console.error('Error fetching student performance:', error);
            throw error;
        }
    }

    async submitAssignment({ assignmentId, studentId, fileData, comments, fileType }) {
        try {
            const [result] = await this.db.execute(`
                INSERT INTO submissions (
                    assignment_id, 
                    student_id, 
                    assignment_file,
                    student_comment,
                    status,
                    submitted_at,
                    file_type
                ) VALUES (?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP, ?)
            `, [assignmentId, studentId, fileData, comments, fileType]);

            return result.insertId;
        } catch (error) {
            console.error('Error submitting assignment:', error);
            throw error;
        }
    }

    async getSubmissionById(submissionId, studentId) {
        try {
            const [submissions] = await this.db.execute(`
                SELECT 
                    s.*,
                    a.title as assignment_title
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.id = ? AND s.student_id = ?
            `, [submissionId, studentId]);

            return submissions[0];
        } catch (error) {
            console.error('Error in getSubmissionById:', error);
            throw error;
        }
    }
}

module.exports = Student; 