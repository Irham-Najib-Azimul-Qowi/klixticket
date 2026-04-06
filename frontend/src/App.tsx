import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import MerchDetailPage from './pages/MerchDetailPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import EventsList from './pages/admin/EventsList';
import CreateEvent from './pages/admin/CreateEvent';
import OrdersList from './pages/admin/OrdersList';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/merchandise/:id" element={<MerchDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes with Layout Wrapper */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default dashboard at /admin */}
          <Route index element={<Dashboard />} />

          {/* Event management routes */}
          <Route path="events" element={<EventsList />} />
          <Route path="events/create" element={<CreateEvent />} />

          {/* Order management routes */}
          <Route path="orders" element={<OrdersList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
