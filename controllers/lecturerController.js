class LecturerController {
    constructor(db) {
        this.db = db;
    }

    // Render lecturer dashboard
    getDashboard(req, res) {
        // Pass the user object from the JWT token to the view
        res.render('lecturer/dashboard', { user: req.user });
    }
}

module.exports = LecturerController; 