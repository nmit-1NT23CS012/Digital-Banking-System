import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/common';
import { Header, Sidebar, Footer } from './components/layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { TransferPage } from './pages/TransferPage';
import { TransactionsPage, ProfilePage } from './pages/TransactionsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import './styles/globals.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Apply dark mode on mount
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }

  return (
    <>
      {isAuthenticated && <Header />}
      <div className={`${isAuthenticated ? 'flex' : ''} min-h-screen bg-light dark:bg-dark`}>
        {isAuthenticated && <Sidebar />}
        <main className={`${isAuthenticated ? 'flex-1 ml-64' : ''} w-full`}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transfer"
              element={
                <ProtectedRoute>
                  <TransferPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {isAuthenticated && <Footer />}
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
