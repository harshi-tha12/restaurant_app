const db = require('../config/db');

exports.login = (req, res) => {

    const { username, password } = req.body;

    console.log("Login attempt:", { username, password }); // Debug log

    const sql = "SELECT * FROM admins WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, result) => {

        if (err) {
            console.error("Database query error:", err); // Debug log
            return res.status(500).json({
                success: false,
                message: "Database Error: " + err.message
            });
        }

        console.log("Query result:", result); // Debug log

        if (result.length > 0) {
            const admin = result[0];
            return res.json({
                success: true,
                message: "Login Successful",
                admin: {
                    id: admin.id,
                    username: admin.username,
                    full_name: admin.full_name,
                    admin_name: admin.admin_name,
                    restaurant_name: admin.restaurant_name
                }
            });

        } else {

            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });

        }

    });

};