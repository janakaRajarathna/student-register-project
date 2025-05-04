class PageController {
    // Render dashboard page
    getDashboard(req, res) {
        res.render('dashboard');
    }

    // Render home page
    getHome(req, res) {
        res.render('home');
    }

    // Render profile page
    getProfile(req, res) {
        res.render('profile');
    }
}

module.exports = new PageController(); 