require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const walletRoutes = require('./routes/wallet');
const dashboardRoutes = require('./routes/dashboard');

// Initialize app
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Expense Tracker API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});
