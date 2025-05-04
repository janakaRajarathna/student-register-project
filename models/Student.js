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
}

module.exports = Student; 