// src/App.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login';
import { DemoHeroGeometric } from './landing/First';
import Register from './pages/auth/Register';

import InvestmentDashboard from './pages/account/InvestmentDash';
import ExpenseManager from './pages/account/Expense';
import EarningsDashboard from './pages/account/Earning';
import TransactionPage from './pages/account/Transact';

// ✅ Create Auth Context first
export const AuthContext = React.createContext();

// ✅ Protected Route now uses context instead of reading localStorage directly
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ✅ Auth Provider
const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  const login = useCallback((token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  }, []);

  const contextValue = useMemo(
    () => ({
      authToken,
      isAuthenticated,
      login,
      logout,
    }),
    [authToken, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DemoHeroGeometric />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/invest"
            element={
              <ProtectedRoute>
                <InvestmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense"
            element={
              <ProtectedRoute>
                <ExpenseManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/earn"
            element={
              <ProtectedRoute>
                 <div className="min-h-screen bg-gray-100">
      <EarningsDashboard />
    </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transact"
            element={
              <ProtectedRoute>
                <TransactionPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
