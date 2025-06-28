import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ReturnToTop from './components/Common/ReturnToTop';
import Home from './pages/Home';
import Students from './pages/Students';
import Lecturers from './pages/Lecturers';
import Reports from './pages/Reports';
import FacultyPage from './pages/FacultyPage';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Alumni from './pages/Alumni';
import Debug from './pages/Debug';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'faculty':
        return <FacultyPage />;
      case 'staff':
        return <Lecturers />;
      case 'students':
        return <Students />;
      case 'reports':
        return <Reports />;
      case 'feed':
        return <Feed />;
      case 'alumni':
        return <Alumni />;
      case 'profile':
        return <Profile />;
      case 'debug':
        return <Debug />;
      default:
        return <Home />;
    }
  };

  // If user is not authenticated, show auth routes
  if (!user) {
    return (
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  // If user is authenticated, show dashboard
  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
      <ReturnToTop />
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;