import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EditProfileSheet } from './components/EditProfileSheet';
import { useOfflineQueue } from './hooks/useOfflineQueue';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Welcome } from './pages/Welcome';
import { Entry } from './pages/Entry';
import { Credit } from './pages/Credit';
import { Stock } from './pages/Stock';
import { Dashboard } from './pages/Dashboard';

function AppLayout() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isOnline, queueCount } = useOfflineQueue();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans selection:bg-amber-200">
      <TopBar
        onOpenProfile={() => setIsProfileOpen(true)}
        pendingSyncCount={queueCount}
        isOnline={isOnline}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4">
        <Outlet />
      </main>

      <BottomNav />

      <EditProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* Protected Routes with Main App Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/entry" element={<Entry />} />
            <Route path="/credit" element={<Credit />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/entry" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/entry" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
