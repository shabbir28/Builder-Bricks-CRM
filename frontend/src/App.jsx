import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth.jsx';

// Components
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import Properties from './pages/Properties.jsx';
import Clients from './pages/Clients.jsx';
import Deals from './pages/Deals.jsx';
import PaymentPlans from './pages/PaymentPlans.jsx';
import LeadDetails from './pages/LeadDetails.jsx';
import Agents from './pages/Agents.jsx';
import Activities from './pages/Activities.jsx';
import Profile from './pages/Profile.jsx';
import Performance from './pages/Performance.jsx';
import InstallmentRequests from './pages/InstallmentRequests.jsx';
import Receipts from './pages/Receipts.jsx';

// Protected Route Component — any authenticated user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route — only super_admin and admin can access
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/leads/:id" element={<LeadDetails />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/payment-plans" element={<PaymentPlans />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/performance" element={<Performance />} />
                    <Route path="/receipts" element={<Receipts />} />

                    {/* Admin-only routes */}
                    <Route path="/agents" element={<AdminRoute><Agents /></AdminRoute>} />
                    <Route path="/activities" element={<AdminRoute><Activities /></AdminRoute>} />
                    <Route path="/installment-requests" element={<AdminRoute><InstallmentRequests /></AdminRoute>} />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111720',
              color: '#e8ecf3',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#111720' },
            },
            error: {
              iconTheme: { primary: '#fb7185', secondary: '#111720' },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
