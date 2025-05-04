class ApiController {
    // Get user data
    getUserData(req, res) {
        res.json({
            status: 'success',
            data: {
                user: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            }
        });
    }

    // Get dashboard stats
    getDashboardStats(req, res) {
        res.json({
            status: 'success',
            data: {
                totalUsers: 100,
                activeUsers: 75,
                newUsers: 10
            }
        });
    }
}

module.exports = new ApiController(); 