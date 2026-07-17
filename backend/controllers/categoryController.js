const db = require("../config/db");

const getCategories = (req, res) => {
    const sql = "SELECT * FROM categories";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

module.exports = {
    getCategories
};