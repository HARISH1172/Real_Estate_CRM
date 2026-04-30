import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';

// Public pages
import Login       from './pages/Login';
import Register    from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Admin
import AdminDashboard  from './components/admin/AdminDashboard';
import ManageManagers  from './components/admin/ManageManagers';
import ManageAgents    from './components/admin/ManageAgents';

// Manager
import ManagerDashboard from './components/manager/ManagerDashboard';
import LeadManagement   from './components/manager/LeadManagement';
import ViewAgents       from './components/manager/ViewAgents';

// Agent
import AgentDashboard from './components/agent/AgentDashboard';
import AgentLeads     from './components/agent/AgentLeads';

// Common
import PropertyManagement from './components/common/PropertyManagement';

import { ROLES } from './utils/constants';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'var(--font-body)', fontSize: 14, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/"             element={<Navigate to="/login" replace />} />

        {/* ── Admin routes ── */}
        <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<Layout title="EstateFlow Admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/managers"  element={<ManageManagers />} />
            <Route path="/admin/agents"    element={<ManageAgents />} />
            <Route path="/admin/leads"     element={<LeadManagement />} />
            <Route path="/admin/properties" element={<PropertyManagement />} />
          </Route>
        </Route>

        {/* ── Manager routes ── */}
        <Route element={<PrivateRoute allowedRoles={[ROLES.MANAGER]} />}>
          <Route element={<Layout title="EstateFlow Manager" />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/leads"     element={<LeadManagement />} />
            <Route path="/manager/agents"    element={<ViewAgents />} />
            <Route path="/manager/properties" element={<PropertyManagement />} />
          </Route>
        </Route>

        {/* ── Agent routes ── */}
        <Route element={<PrivateRoute allowedRoles={[ROLES.AGENT]} />}>
          <Route element={<Layout title="EstateFlow Agent" />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/leads"      element={<AgentLeads />} />
            <Route path="/agent/properties" element={<PropertyManagement />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
