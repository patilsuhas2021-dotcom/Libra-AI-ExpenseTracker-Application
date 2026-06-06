import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { token, authFetch, refreshProfile } = useAuth();
  
  const [walletBalance, setWalletBalance] = useState(5000);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await authFetch('/dashboard/summary');
      if (res.success) {
        setWalletBalance(res.data.walletBalance);
        setTotalExpenses(res.data.totalExpenses);
        setMonthlyExpenses(res.data.monthlyExpenses);
        setCategoryBreakdown(res.data.categoryBreakdown);
        setRecentTransactions(res.data.recentTransactions);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (params = {}) => {
    if (!token) return;
    try {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await authFetch(`/expenses${queryString}`);
      if (res.success) {
        setExpenses(res.data);
        return { success: true, data: res.data };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to fetch expenses' };
    }
  };

  const addIncome = async (incomeData) => {
    try {
      const res = await authFetch('/wallet/income', {
        method: 'POST',
        body: JSON.stringify(incomeData)
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        await fetchDashboard();
        await refreshProfile();
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to add income' };
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const res = await authFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData)
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        await fetchDashboard();
        await refreshProfile();
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to add expense' };
    }
  };

  const editExpense = async (id, expenseData) => {
    try {
      const res = await authFetch(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData)
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        await fetchDashboard();
        await refreshProfile();
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to edit expense' };
    }
  };

  const deleteExpense = async (id) => {
    try {
      const res = await authFetch(`/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setWalletBalance(res.walletBalance);
        await fetchDashboard();
        await refreshProfile();
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: 'Failed to delete expense' };
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        totalExpenses,
        monthlyExpenses,
        categoryBreakdown,
        recentTransactions,
        expenses,
        loading,
        fetchDashboard,
        fetchExpenses,
        addIncome,
        addExpense,
        editExpense,
        deleteExpense
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
