// backend/server.js
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/categoryRoutes');
const path = require('path');
require('dotenv').config();

// assign db so routes can use it
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// root route (simple health/info)
app.get('/', (req, res) => {
  res.send('Restaurant Ordering API Running 🚀');
});

// optional DB health route (uses `db` from config)
app.get('/health', (req, res) => {
  db.query('SELECT 1 + 1 AS ok', (err) => {
    if (err) {
      console.error('Health DB check failed:', err);
      return res.status(500).json({ ok: false, db: false, error: err.message });
    }
    return res.json({ ok: true, db: true });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});