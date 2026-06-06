const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all expenses with searching and filtering
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, startDate, endDate } = req.query;
    
    // Build query object
    let query = { userId: req.user.id };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Fetch and sort by date descending
    const expenses = await Expense.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, amount, category, date, description } = req.body;

  try {
    // Basic validations
    if (!title || !amount || !category) {
      return res.status(400).json({ success: false, message: 'Please add a title, amount and category' });
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    // Atomic check and update of wallet balance to prevent overdrafts
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id, walletBalance: { $gte: expenseAmount } },
      { $inc: { walletBalance: -expenseAmount } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient wallet balance. You need Rs. ${expenseAmount.toFixed(2)} but only have Rs. ${req.user.walletBalance.toFixed(2)}.` 
      });
    }

    // Save expense
    const expense = await Expense.create({
      userId: req.user.id,
      title,
      amount: expenseAmount,
      category,
      date: date ? new Date(date) : undefined,
      description
    });

    res.status(201).json({
      success: true,
      data: expense,
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Edit an expense
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, amount, category, date, description } = req.body;

  try {
    // Find expense first
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const newAmount = amount ? parseFloat(amount) : expense.amount;
    if (amount && (isNaN(newAmount) || newAmount <= 0)) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    const diff = newAmount - expense.amount;

    let updatedUser;
    if (diff > 0) {
      // Amount increased: check if user has enough balance for the difference
      updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id, walletBalance: { $gte: diff } },
        { $inc: { walletBalance: -diff } },
        { new: true }
      );

      if (!updatedUser) {
        // Fetch current user details to show real balance
        const user = await User.findById(req.user.id);
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient wallet balance to edit this expense. Needs an extra Rs. ${diff.toFixed(2)} but only have Rs. ${user.walletBalance.toFixed(2)}.` 
        });
      }
    } else if (diff < 0) {
      // Amount decreased: refund difference back to user wallet
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { walletBalance: -diff } }, // -diff is positive since diff is negative
        { new: true }
      );
    } else {
      // Amount remained same, just get current user
      updatedUser = await User.findById(req.user.id);
    }

    // Update expense fields
    expense.title = title || expense.title;
    expense.amount = newAmount;
    expense.category = category || expense.category;
    expense.date = date ? new Date(date) : expense.date;
    expense.description = description !== undefined ? description : expense.description;

    await expense.save();

    res.json({
      success: true,
      data: expense,
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find expense first
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Delete expense
    await Expense.deleteOne({ _id: req.params.id });

    // Refund the deleted expense amount back to user's wallet
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: expense.amount } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Expense removed and refunded to wallet',
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
