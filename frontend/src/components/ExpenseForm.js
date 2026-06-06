import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { AlertCircle, Plus, Check } from 'lucide-react';

const ExpenseForm = ({ expenseToEdit, onClose, addToast }) => {
  const { walletBalance, addExpense, editExpense } = useWallet();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [overdraftWarning, setOverdraftWarning] = useState(false);

  const isEditMode = !!expenseToEdit;

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      if (expenseToEdit.date) {
        setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      }
      setDescription(expenseToEdit.description || '');
    }
  }, [expenseToEdit]);

  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      if (isEditMode) {
        const diff = numAmount - expenseToEdit.amount;
        setOverdraftWarning(diff > walletBalance);
      } else {
        setOverdraftWarning(numAmount > walletBalance);
      }
    } else {
      setOverdraftWarning(false);
    }
  }, [amount, walletBalance, isEditMode, expenseToEdit]);

  const validate = () => {
    const tempErrors = {};
    if (!title.trim()) tempErrors.title = 'Title is required';
    
    const numAmount = parseFloat(amount);
    if (!amount) {
      tempErrors.amount = 'Amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      tempErrors.amount = 'Amount must be a positive number';
    } else {
      if (isEditMode) {
        const diff = numAmount - expenseToEdit.amount;
        if (diff > walletBalance) {
          tempErrors.amount = `Insufficient wallet balance. You need an extra Rs. ${diff.toFixed(2)} but only have Rs. ${walletBalance.toFixed(2)}.`;
        }
      } else {
        if (numAmount > walletBalance) {
          tempErrors.amount = `Insufficient wallet balance. Total cost (Rs. ${numAmount.toFixed(2)}) exceeds balance (Rs. ${walletBalance.toFixed(2)}).`;
        }
      }
    }

    if (!category) tempErrors.category = 'Category is required';
    if (!date) tempErrors.date = 'Date is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      const numAmount = parseFloat(amount);
      if (numAmount > 0) {
        if (isEditMode && (numAmount - expenseToEdit.amount > walletBalance)) {
          addToast('Edit Blocked: Expense difference exceeds your wallet balance!', 'error');
        } else if (!isEditMode && numAmount > walletBalance) {
          addToast('Transaction Blocked: Insufficient wallet balance!', 'error');
        }
      }
      return;
    }

    setLoading(true);
    const expenseData = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim()
    };

    let result;
    if (isEditMode) {
      result = await editExpense(expenseToEdit._id, expenseData);
      if (result.success) {
        addToast('Expense updated successfully!', 'success');
        onClose();
      } else {
        addToast(result.message || 'Failed to update expense', 'error');
      }
    } else {
      result = await addExpense(expenseData);
      if (result.success) {
        addToast('Expense added successfully!', 'success');
        onClose();
      } else {
        addToast(result.message || 'Failed to add expense', 'error');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="expense-title">Title / Name</label>
        <input
          id="expense-title"
          type="text"
          className="form-control"
          placeholder="e.g. Grocery shopping, Electricity bill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-amount">Amount (Rs.)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            ₹
          </span>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            className="form-control"
            style={{ paddingLeft: '30px' }}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {errors.amount && <div className="form-error">{errors.amount}</div>}
        
        {overdraftWarning && !errors.amount && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'var(--accent-warning)', 
              fontSize: '0.8rem', 
              marginTop: '0.35rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={14} />
            <span>Warning: This exceeds your available balance! Transaction will be blocked.</span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-category">Category</label>
        <select
          id="expense-category"
          className="form-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Food">Food</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Travel">Travel</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Shopping">Shopping</option>
          <option value="House Keeping">House Keeping</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>
        {errors.category && <div className="form-error">{errors.category}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-date">Date</label>
        <input
          id="expense-date"
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <div className="form-error">{errors.date}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expense-desc">Description (Optional)</label>
        <textarea
          id="expense-desc"
          rows="3"
          className="form-control"
          placeholder="Brief notes about this transaction..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength="250"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {isEditMode ? <Check size={18} /> : <Plus size={18} />}
          <span>{isEditMode ? 'Save Changes' : 'Add Expense'}</span>
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
