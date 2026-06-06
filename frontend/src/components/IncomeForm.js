import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Plus } from 'lucide-react';

const IncomeForm = ({ onClose, addToast }) => {
  const { addIncome } = useWallet();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!title.trim()) tempErrors.title = 'Title is required';
    
    const numAmount = parseFloat(amount);
    if (!amount) {
      tempErrors.amount = 'Amount is required';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      tempErrors.amount = 'Amount must be a positive number';
    }

    if (!date) tempErrors.date = 'Date is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const incomeData = {
      title: title.trim(),
      amount: parseFloat(amount),
      date,
      description: description.trim()
    };

    const result = await addIncome(incomeData);
    if (result.success) {
      addToast(`Added Rs. ${parseFloat(amount).toFixed(2)} to your wallet balance!`, 'success');
      onClose();
    } else {
      addToast(result.message || 'Failed to add income', 'error');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="income-title">Source / Title</label>
        <input
          id="income-title"
          type="text"
          className="form-control"
          placeholder="e.g. Monthly salary, Freelance work, Pocket money"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="income-amount">Amount (Rs.)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            ₹
          </span>
          <input
            id="income-amount"
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
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="income-date">Date</label>
        <input
          id="income-date"
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <div className="form-error">{errors.date}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="income-desc">Description (Optional)</label>
        <textarea
          id="income-desc"
          rows="3"
          className="form-control"
          placeholder="Notes about this income source..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength="250"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={loading}>
          <Plus size={18} />
          <span>Add Income</span>
        </button>
      </div>
    </form>
  );
};

export default IncomeForm;
