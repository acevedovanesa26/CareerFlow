import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Login from './pages/Login';

// Lazy load other less critical pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const DocumentGenerator = React.lazy(() => import('./pages/DocumentGenerator'));
const CVBuilder = React.lazy(() => import('./pages/CVBuilder'));
const CVAnalyzer = React.lazy(() => import('./pages/CVAnalyzer'));
const InterviewSimulator = React.lazy(() => import('./pages/InterviewSimulator'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Blog = React.lazy(() => import('./pages/Blog'));
const About = React.lazy(() => import('./pages/About'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Security = React.lazy(() => import('./pages/Security'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-brand-bright border-t-transparent rounded-full mb-6" 
      />
      <h2 className="text-xl font-bold text-brand-dark mb-2">Iniciando Career Flow...</h2>
      <p className="text-zinc-500 text-sm max-w-xs mb-8">
        Si esto toma más de 10 segundos, es posible que tu navegador esté bloqueando la conexión.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary !py-3 text-sm"
        >
          Reintentar conexión
        </button>
        <a 
          href={window.location.href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-brand-bright font-bold text-sm hover:underline"
        >
          Abrir en pestaña nueva (Recomendado)
        </a>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{
        className: 'font-bold text-sm',
        duration: 4000,
        style: {
          borderRadius: '1rem',
          background: '#FFFFFF',
          color: '#1A1A1A',
        }
      }} />
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="w-10 h-10 border-2 border-brand-bright border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/docs" element={<ProtectedRoute><Layout><DocumentGenerator /></Layout></ProtectedRoute>} />
          <Route path="/cv-builder" element={<ProtectedRoute><Layout><CVBuilder /></Layout></ProtectedRoute>} />
          <Route path="/cv-analyzer" element={<ProtectedRoute><Layout><CVAnalyzer /></Layout></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><Layout><InterviewSimulator /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          
          {/* Fallback - Redirect to login if not matched, which then redirects to dashboard if logged in */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
