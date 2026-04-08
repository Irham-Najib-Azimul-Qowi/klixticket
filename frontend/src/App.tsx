import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import MerchDetailPage from './pages/MerchDetailPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import EventsList from './pages/admin/EventsList';
import CreateEvent from './pages/admin/CreateEvent';
import OrdersList from './pages/admin/OrdersList';
import MerchList from './pages/admin/MerchList';
import CreateMerch from './pages/admin/CreateMerch';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        {/* Admin Routes with Layout Wrapper */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventsList />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="merchandise" element={<MerchList />} />
          <Route path="merch/create" element={<CreateMerch />} />
          <Route path="orders" element={<OrdersList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
