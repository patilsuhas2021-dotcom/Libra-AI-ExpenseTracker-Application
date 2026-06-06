const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/wallet/income
// @desc    Add income to wallet
// @access  Private
router.post('/income', protect, async (req, res) => {
  const { title, amount, date, description } = req.body;

  try {
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Please add a title and amount' });
    }

    const incomeAmount = parseFloat(amount);
    if (isNaN(incomeAmount) || incomeAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    // Save income transaction
    const income = await Income.create({
      userId: req.user.id,
      title,
      amount: incomeAmount,
      date: date ? new Date(date) : undefined,
      description
    });

    // Update user wallet balance (increment)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: incomeAmount } },
      { new: true }
    ).select('-passwordHash');

    res.status(201).json({
      success: true,
      data: income,
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/wallet/incomes
// @desc    Get all income transactions
// @access  Private
router.get('/incomes', protect, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({
      success: true,
      count: incomes.length,
      data: incomes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
