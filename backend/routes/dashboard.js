const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/summary
// @desc    Get dashboard metrics (Total expenses, Monthly expenses, category breakdown, recent transactions)
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user for current wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get time window for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch all expenses and incomes
    const expenses = await Expense.find({ userId });
    const incomes = await Income.find({ userId });

    // Calculate aggregations in JS
    let totalExpenses = 0;
    let monthlyExpenses = 0;
    const categoryMap = {
      Food: 0,
      Utilities: 0,
      Entertainment: 0,
      Travel: 0,
      Health: 0,
      Education: 0,
      Shopping: 0,
      Miscellaneous: 0
    };

    expenses.forEach(exp => {
      totalExpenses += exp.amount;

      // Check if expense falls in current calendar month
      const expDate = new Date(exp.date);
      if (expDate >= startOfMonth && expDate <= endOfMonth) {
        monthlyExpenses += exp.amount;
      }

      // Add to category
      if (categoryMap[exp.category] !== undefined) {
        categoryMap[exp.category] += exp.amount;
      } else {
        categoryMap.Miscellaneous += exp.amount;
      }
    });

    // Format category breakdown for charts
    const categoryBreakdown = Object.keys(categoryMap).map(key => ({
      category: key,
      amount: categoryMap[key]
    })).filter(item => item.amount > 0); // Only return categories with spendings

    // Compile recent transactions (combine expense & income lists)
    const formattedExpenses = expenses.map(exp => ({
      _id: exp._id,
      title: exp.title,
      amount: exp.amount,
      type: 'expense',
      category: exp.category,
      date: exp.date,
      description: exp.description
    }));

    const formattedIncomes = incomes.map(inc => ({
      _id: inc._id,
      title: inc.title,
      amount: inc.amount,
      type: 'income',
      category: 'Income',
      date: inc.date,
      description: inc.description
    }));

    // Combine, sort by date desc, and take top 10
    const recentTransactions = [...formattedExpenses, ...formattedIncomes]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        walletBalance: user.walletBalance,
        totalExpenses,
        monthlyExpenses,
        categoryBreakdown,
        recentTransactions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
