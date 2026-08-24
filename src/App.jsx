import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';
import { selectIsAuthenticated } from './features/auth/authSlice';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProblemsListPage from './features/problems/ProblemsListPage';
import ProblemDetailPage from './features/problems/ProblemDetailPage';
import AskProblemPage from './features/problems/AskProblemPage';
import FaqPage from './features/faqs/FaqPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import AdminLayout from './features/admin/AdminLayout';
import AdminUsersPage from './features/admin/AdminUsersPage';
import AdminContentPage from './features/admin/AdminContentPage';
import AdminFaqsPage from './features/admin/AdminFaqsPage';
import AdminReportsPage from './features/admin/AdminReportsPage';
import NotFoundPage from './components/NotFoundPage';

function HomeRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/questions'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone, full-bleed — no sidebar/topbar shell */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/questions" element={<ProblemsListPage />} />
          <Route path="/questions/:id" element={<ProblemDetailPage />} />
          <Route path="/faq" element={<FaqPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ask" element={<AskProblemPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="faqs" element={<AdminFaqsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;