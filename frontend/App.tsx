import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import DashboardLayout from './components/DashboardLayout';
import DashboardView from './components/views/DashboardView';
import ScalpingView from './components/views/ScalpingView';
import LoanView from './components/views/LoanView';
import GrantView from './components/views/GrantView';
import ProfileView from './components/views/ProfileView';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/AdminOverview';
import AdminClients from './components/admin/AdminClients';
import AdminAdmins from './components/admin/AdminAdmins';
import AdminLoans from './components/admin/AdminLoans';
import AdminGrants from './components/admin/AdminGrants';
import AdminScalping from './components/admin/AdminScalping';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={<LoginView setUser={setUser} />} />
        <Route path="/register" element={<RegisterView setUser={setUser} />} />

        {/* Client app */}
        <Route path="/app" element={<DashboardLayout user={user} setUser={setUser} />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="scalping" element={<ScalpingView />} />
          <Route path="loans" element={<LoanView />} />
          <Route path="grants" element={<GrantView />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>

        {/* Legacy URL (keep for backward compat) */}
        <Route path="/myAccount" element={<Navigate to="/app/dashboard" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout user={user} setUser={setUser} />}>
          <Route index element={<AdminOverview />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="scalpings" element={<AdminScalping />} />
          <Route path="loans" element={<AdminLoans />} />
          <Route path="grants" element={<AdminGrants />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
