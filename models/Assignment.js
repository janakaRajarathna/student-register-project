class Assignment {
    constructor(db) {
        this.db = db;
    }

    async create(assignmentData) {
        try {
            const { title, description, deadline, maxMarks, createdBy } = assignmentData;

            const query = `
                INSERT INTO assignments (title, description, deadline, max_marks, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;

            const [result] = await this.db.execute(query, [
                title,
                description,
                deadline,
                maxMarks,
                createdBy
            ]);

            return {
                success: true,
                assignmentId: result.insertId
            };
        } catch (error) {
            console.error('Error creating assignment:', error);
            return {
                success: false,
                message: 'Failed to create assignment'
            };
        }
    }
}

module.exports = Assignment; 