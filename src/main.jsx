import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import { AuthenticatedRoute, OperatorRoute, UserRoute } from './components/auth/ProtectedRoutes.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import Areas from './pages/Areas.jsx';
import Automation from './pages/Automation.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import MonitorLights from './pages/MonitorLights.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import StreetLights from './pages/StreetLights.jsx';
import UserAreas from './pages/UserAreas.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import UserFaults from './pages/UserFaults.jsx';
import UserReports from './pages/UserReports.jsx';
import UserReportIssue from './pages/UserReportIssue.jsx';
import UserStreetLights from './pages/UserStreetLights.jsx';
import './styles/dashboard.css';
import './styles/global.css';
import './styles/login.css';
function IndexRedirect() {
  // The application entry point is always the login screen. The login form
  // decides the destination after the backend successfully authenticates the
  // selected role; this prevents a previous operator token from silently
  // opening the operator dashboard.
  return <Navigate to="/login" replace />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<IndexRedirect />} />
          <Route path="login" element={<Login />} />

          {/* Protected Operator Routes (Blocked for USER role) */}
          <Route element={<OperatorRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="street-lights" element={<StreetLights />} />
            <Route path="areas" element={<Areas />} />
            <Route path="reports" element={<Reports />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route element={<AuthenticatedRoute />}>
            <Route path="monitor-lights" element={<MonitorLights />} />
            <Route path="automation" element={<Automation />} />
          </Route>

          {/* Protected User Dashboard Routes */}
          <Route element={<UserRoute />}>
            <Route path="user-dashboard" element={<UserDashboard />} />
            <Route path="user-dashboard/street-lights" element={<UserStreetLights />} />
            <Route path="user-dashboard/areas" element={<UserAreas />} />
            <Route path="user-dashboard/faults" element={<UserFaults />} />
            <Route path="user-dashboard/reports" element={<UserReports />} />
            <Route path="user-dashboard/report" element={<UserReportIssue />} />
            <Route path="user/dashboard" element={<Navigate to="/user-dashboard" replace />} />
            <Route path="user/street-lights" element={<UserStreetLights />} />
            <Route path="user/areas" element={<UserAreas />} />
            <Route path="user/faults" element={<UserFaults />} />
            <Route path="user/reports" element={<UserReports />} />
          </Route>

          <Route path="*" element={<IndexRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
