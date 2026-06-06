import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  Moon, 
  Sun, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { walletBalance } = useWallet();

  if (!user) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-container">
          <TrendingDown size={28} className="logo-icon" style={{ color: 'var(--accent-primary)' }} />
          <span className="logo-text">ExpenseTracker</span>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>

          <div 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={20} />
            <span>Expenses Log</span>
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-card" style={{ marginBottom: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
          <Wallet size={18} style={{ color: 'var(--accent-success)' }} />
          <div className="user-info">
            <span className="user-role">Available Balance</span>
            <span className="user-name" style={{ fontSize: '0.9rem', color: 'var(--accent-success)' }}>
              {formatCurrency(walletBalance)}
            </span>
          </div>
        </div>

        <div className="user-profile-card">
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-role">Member</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary nav-link" 
            style={{ padding: '0.6rem', flex: 1, display: 'flex', justifyContent: 'center' }} 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button 
            className="btn btn-danger nav-link" 
            style={{ padding: '0.6rem', flex: 1, display: 'flex', justifyContent: 'center', backgroundColor: 'var(--accent-danger-light)', color: 'var(--accent-danger)' }} 
            onClick={logout}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
