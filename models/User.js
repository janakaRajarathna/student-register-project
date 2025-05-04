const bcrypt = require('bcryptjs');

class User {
    constructor(db) {
        this.db = db;
    }

    async findByEmail(email) {
        try {
            const [users] = await this.db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return users[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const { name, email, password, role } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await this.db.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User; 