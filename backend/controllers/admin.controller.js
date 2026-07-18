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

            return res.json({
                success: true,
                message: "Login Successful",
                admin: result[0]
            });

        } else {

            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });

        }

    });

};
