const express = require("express");
const cors = require("cors");
const adminRoutes = require('./routes/admin.routes');
require("dotenv").config();

require("./config/db");

const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
    res.send("Restaurant Ordering API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});