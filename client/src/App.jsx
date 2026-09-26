import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import JobDiscoveryPage from './pages/student/JobDiscoveryPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ResumeAnalyzerPage from './pages/student/ResumeAnalyzerPage';
import AIInterviewPrepPage from './pages/student/AIInterviewPrepPage';
import AICareerAssistantPage from './pages/student/AICareerAssistantPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJobPage from './pages/recruiter/PostJobPage';
import ManageJobsPage from './pages/recruiter/ManageJobsPage';
import ApplicantTrackingPage from './pages/recruiter/ApplicantTrackingPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-medium text-indigo-600 animate-pulse">Loading CareerBridgeAI...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobDiscoveryPage />} />
      </Route>

      {/* Dedicated Master Admin Login Portal (Isolated Route) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Student Protected Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/jobs" element={<JobDiscoveryPage />} />
        <Route path="/student/applications" element={<StudentDashboard />} />
        <Route path="/student/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/student/interview-prep" element={<AIInterviewPrepPage />} />
        <Route path="/student/ai-assistant" element={<AICareerAssistantPage />} />
        <Route path="/student/skill-gap" element={<ResumeAnalyzerPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
      </Route>

      {/* Recruiter Protected Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/jobs/new" element={<PostJobPage />} />
        <Route path="/recruiter/jobs" element={<ManageJobsPage />} />
        <Route path="/recruiter/applicants" element={<ApplicantTrackingPage />} />
      </Route>

      {/* TPO Protected Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['tpo', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tpo/dashboard" element={<RecruiterDashboard />} />
      </Route>

      {/* Admin Portal */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard initialTab="overview" />} />
        <Route path="/admin/users" element={<AdminDashboard initialTab="users" />} />
        <Route path="/admin/jobs" element={<AdminDashboard initialTab="jobs" />} />
        <Route path="/admin/applications" element={<AdminDashboard initialTab="applications" />} />
        <Route path="/admin/questions" element={<AdminDashboard initialTab="questions" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
