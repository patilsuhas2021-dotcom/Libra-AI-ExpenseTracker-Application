import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpenseHistory from './components/ExpenseHistory';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import Auth from './components/Auth';
import { X, AlertCircle } from 'lucide-react';
import './styles/index.css';

const AppContent = () => {
  const { token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setShowExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setExpenseToEdit(null);
    setShowExpenseModal(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Expense Tracker...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Setting up secure connections</div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <Auth addToast={addToast} />
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div className="toast-message">{toast.message}</div>
              <button 
                className="btn-icon-only" 
                style={{ marginLeft: 'auto', padding: '0.2rem' }}
                onClick={() => removeToast(toast.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <Dashboard 
            onAddExpense={() => setShowExpenseModal(true)} 
            onAddIncome={() => setShowIncomeModal(true)} 
            onViewHistory={() => setActiveTab('history')}
          />
        ) : (
          <ExpenseHistory 
            onEditExpense={handleEditExpense} 
            addToast={addToast}
            onViewDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {showExpenseModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h3>
              <button className="btn-icon-only" onClick={handleCloseExpenseModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <ExpenseForm 
                expenseToEdit={expenseToEdit} 
                onClose={handleCloseExpenseModal} 
                addToast={addToast} 
              />
            </div>
          </div>
        </div>
      )}

      {showIncomeModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">Add Income</h3>
              <button className="btn-icon-only" onClick={() => setShowIncomeModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <IncomeForm 
                onClose={() => setShowIncomeModal(false)} 
                addToast={addToast} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div className="toast-message">{toast.message}</div>
            <button 
              className="btn-icon-only" 
              style={{ marginLeft: 'auto', padding: '0.2rem' }}
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppContent;
