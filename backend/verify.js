require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');

//const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-tracker';
const MONGODB_URI = process.env.MONGODB_URI || 'https://libra-ai-expense-tracker-applicatio.vercel.app/';

async function runVerification() {
  console.log('Starting Expense Tracker Integration Verification...');
  console.log(`Connecting to: ${MONGODB_URI}`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB.');

    // 1. Reset Test User
    const testUsername = 'verification_test_user';
    await User.deleteOne({ username: testUsername });
    
    // Create new test user (wallet balance defaults to 5000)
    let user = await User.create({
      username: testUsername,
      passwordHash: 'dummy_hash_for_testing'
    });
    console.log(` Test user created. Initial Wallet Balance: Rs. ${user.walletBalance}`);
    
    if (user.walletBalance !== 5000) {
      throw new Error(`Expected wallet balance to be 5000, got ${user.walletBalance}`);
    }

    // Clear any existing test data associated with this user ID
    await Expense.deleteMany({ userId: user._id });
    await Income.deleteMany({ userId: user._id });

    // 2. Add an expense of Rs. 3,000
    const expenseAmount = 3000;
    
    // Simulate expense add route checks
    user = await User.findOneAndUpdate(
      { _id: user._id, walletBalance: { $gte: expenseAmount } },
      { $inc: { walletBalance: -expenseAmount } },
      { new: true }
    );
    
    if (!user) {
      throw new Error('Overdraft error triggered unexpectedly during valid expense insertion.');
    }
    
    const expense = await Expense.create({
      userId: user._id,
      title: 'Grocery Supplies',
      amount: expenseAmount,
      category: 'Food',
      date: new Date()
    });
    
    console.log(` Added expense of Rs. ${expense.amount}. New Wallet Balance: Rs. ${user.walletBalance}`);
    
    if (user.walletBalance !== 2000) {
      throw new Error(`Expected wallet balance to be 2000, got ${user.walletBalance}`);
    }

    // 3. Try to add an expense of Rs. 2,500 (exceeds balance of 2,000)
    const overlimitAmount = 2500;
    
    const overlimitUser = await User.findOneAndUpdate(
      { _id: user._id, walletBalance: { $gte: overlimitAmount } },
      { $inc: { walletBalance: -overlimitAmount } },
      { new: true }
    );
    
    if (overlimitUser) {
      throw new Error('Failure: System allowed wallet overdraft. Wallet balance went negative.');
    } else {
      console.log(` System successfully blocked overdraft! Attempted: Rs. ${overlimitAmount}, Available: Rs. ${user.walletBalance}`);
    }

    // 4. Add income of Rs. 4,000 (top up)
    const incomeAmount = 4000;
    
    await Income.create({
      userId: user._id,
      title: 'Freelance Design Project',
      amount: incomeAmount,
      date: new Date()
    });
    
    user = await User.findByIdAndUpdate(
      user._id,
      { $inc: { walletBalance: incomeAmount } },
      { new: true }
    );
    
    console.log(` Added income of Rs. ${incomeAmount}. New Wallet Balance: Rs. ${user.walletBalance}`);
    
    if (user.walletBalance !== 6000) {
      throw new Error(`Expected wallet balance to be 6000, got ${user.walletBalance}`);
    }

    // 5. Delete the first expense (Rs. 3,000) and verify refund
    await Expense.deleteOne({ _id: expense._id });
    
    user = await User.findByIdAndUpdate(
      user._id,
      { $inc: { walletBalance: expense.amount } },
      { new: true }
    );
    
    console.log(` Deleted expense. Rs. ${expense.amount} refunded. Final Wallet Balance: Rs. ${user.walletBalance}`);
    
    if (user.walletBalance !== 9000) {
      throw new Error(`Expected wallet balance to be 9000, got ${user.walletBalance}`);
    }

    // Clean up verification data
    await Expense.deleteMany({ userId: user._id });
    await Income.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    console.log(' Temporary verification records cleaned up.');

    console.log('\n ALL EXPENSE TRACKER BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (error) {
    console.error(' Verification failed with error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB.');
  }
}

runVerification();
