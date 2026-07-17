import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store, queryClient, RootState } from '@/store';
import { useBootstrapAuth } from '@/features/auth/useAuth';
import { ProtectedRoute, RoleProtectedRoute } from '@/components/ProtectedRoute';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';

import { CandidateDashboard } from '@/pages/candidate/CandidateDashboard';
import { RecruiterDashboard } from '@/pages/recruiter/RecruiterDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

// Coding Platform
import { CodingWorkspace } from '@/features/coding/components/CodingWorkspace';
import { RecruiterShadow } from '@/features/coding/components/RecruiterShadow';

// AI Interview
import { InterviewChat } from '@/features/interviews/components/InterviewChat';

function AppRoutes() {
  useBootstrapAuth();
  
  const theme = useSelector((state: RootState) => state.ui.theme);
  
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected routes */}
      <Route
        path="/candidate/problems/:problemId"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['candidate']}>
              <CodingWorkspace />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/interviews/:id/chat"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['candidate']}>
              <InterviewChat />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/*"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/shadow/:problemId/:candidateId"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterShadow />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/*"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterDashboard />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
