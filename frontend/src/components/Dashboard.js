import React from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import CategoryChart from './CategoryChart';
import { 
  Wallet, 
  TrendingDown, 
  CalendarDays, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const Dashboard = ({ onAddExpense, onAddIncome, onViewHistory }) => {
  const { user } = useAuth();
  const { 
    walletBalance, 
    totalExpenses, 
    monthlyExpenses, 
    categoryBreakdown, 
    recentTransactions 
  } = useWallet();

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

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="header-title">Hello, {user?.username}</h1>
          <p className="header-subtitle">Track, analyze and optimize your spending habits.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-success" onClick={onAddIncome}>
            <TrendingUp size={18} />
            <span>Add Income</span>
          </button>
          <button className="btn btn-primary" onClick={onAddExpense}>
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div>
            <span className="kpi-title">Wallet Balance</span>
            <div className="kpi-value" style={{ color: 'var(--accent-success)' }}>
              {formatCurrency(walletBalance)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Initial setup: Rs. 5,000</span>
          </div>
          <div className="kpi-icon-container kpi-icon-wallet">
            <Wallet size={24} />
          </div>
        </div>

        <div className="card kpi-card">
          <div>
            <span className="kpi-title">Monthly Expenses</span>
            <div className="kpi-value" style={{ color: 'var(--accent-primary)' }}>
              {formatCurrency(monthlyExpenses)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spendings in {currentMonthName}</span>
          </div>
          <div className="kpi-icon-container kpi-icon-monthly">
            <CalendarDays size={24} />
          </div>
        </div>

        <div className="card kpi-card">
          <div>
            <span className="kpi-title">Total Expenses</span>
            <div className="kpi-value" style={{ color: 'var(--accent-danger)' }}>
              {formatCurrency(totalExpenses)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All-time recorded spends</span>
          </div>
          <div className="kpi-icon-container kpi-icon-expenses">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-flex">
            <h3 className="card-title">Category Breakdown</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>All-time</span>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryChart data={categoryBreakdown} />
          </div>
        </div>

        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-title">Recent Transactions</h3>
            <button 
              className="btn-icon-only" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}
              onClick={onViewHistory}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '320px', overflowY: 'auto' }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                <p style={{ fontSize: '0.9rem' }}>No recent activity.</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Add incomes or expenses to see logs.</p>
              </div>
            ) : (
              recentTransactions.map((tx, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                  title={tx.description || ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: tx.type === 'income' ? 'var(--accent-success-light)' : 'var(--accent-danger-light)',
                      color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)',
                      flexShrink: 0
                    }}>
                      {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {tx.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span style={{ 
                          color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--text-secondary)',
                          fontWeight: tx.type === 'income' ? 600 : 400
                        }}>{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '0.95rem',
                    color: tx.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    marginLeft: '0.5rem'
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
