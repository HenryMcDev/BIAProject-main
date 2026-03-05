import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateArt from './pages/CreateArt';
import { AuthProvider, useAuth } from './context/AuthContext';

import PromptLibrary from './pages/PromptLibrary';
import ScheduleCalendar from './pages/ScheduleCalendar';
import SupabaseDiagnostic from './components/SupabaseDiagnostic';
import ResetPasswordModal from './components/ResetPasswordModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  return (
    <>
      <ResetPasswordModal />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/create" element={
          <ProtectedRoute>
            <Layout>
              <CreateArt />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/library" element={
          <ProtectedRoute>
            <Layout>
              <PromptLibrary />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/schedule" element={
          <ProtectedRoute>
            <Layout>
              <ScheduleCalendar />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/test-db" element={
          <ProtectedRoute>
            <Layout>
              <SupabaseDiagnostic />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
