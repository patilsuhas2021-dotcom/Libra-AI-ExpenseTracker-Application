import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { Search, Edit2, Trash2, Filter, XCircle, ChevronLeft } from 'lucide-react';

const ExpenseHistory = ({ onEditExpense, addToast, onViewDashboard }) => {
  const { expenses, fetchExpenses, deleteExpense } = useWallet();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFilter = async () => {
    setLoading(true);
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (search.trim()) params.search = search.trim();
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    await fetchExpenses(params);
    setLoading(false);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilter();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    if (search === '' && category === 'All' && startDate === '' && endDate === '') {
      fetchExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, startDate, endDate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense? The amount will be refunded to your wallet.')) {
      const res = await deleteExpense(id);
      if (res.success) {
        addToast('Expense deleted and refunded successfully!', 'success');
        handleFilter();
      } else {
        addToast(res.message || 'Failed to delete expense', 'error');
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="header-title">Expenses Log</h1>
          <p className="header-subtitle">Search, filter, edit or remove transactions.</p>
        </div>
        <button className="btn btn-secondary" onClick={onViewDashboard}>
          <ChevronLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} className="filters-bar">
          <div className="filter-input-wrapper">
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} 
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '40px' }}
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>To:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              <Filter size={16} />
              <span>Search</span>
            </button>
            {(search || category !== 'All' || startDate || endDate) && (
              <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
                <XCircle size={16} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>

        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Loading logs...
            </div>
          ) : expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>No expenses found matching the criteria.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try modifying your filter settings or search terms.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{formatDate(expense.date)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{expense.title}</td>
                    <td>
                      <span className={`badge badge-${expense.category.toLowerCase()}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={expense.description || ''}>
                      {expense.description || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(expense.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                        <button 
                          className="btn-icon-only" 
                          onClick={() => onEditExpense(expense)}
                          title="Edit expense"
                        >
                          <Edit2 size={16} style={{ color: 'var(--accent-primary)' }} />
                        </button>
                        <button 
                          className="btn-icon-only" 
                          onClick={() => handleDelete(expense._id)}
                          title="Delete expense"
                        >
                          <Trash2 size={16} style={{ color: 'var(--accent-danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistory;
