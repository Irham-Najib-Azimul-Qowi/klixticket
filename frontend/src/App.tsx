import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';

// Public Pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const MerchDetailPage = lazy(() => import('@/pages/MerchDetailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('@/pages/PaymentFailed'));
const TicketPage = lazy(() => import('@/pages/TicketPage'));

// Admin Pages
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const EventsList = lazy(() => import('@/pages/admin/EventsList'));
const CreateEvent = lazy(() => import('@/pages/admin/CreateEvent'));
const UpdateEvent = lazy(() => import('@/pages/admin/UpdateEvent'));
const OrdersList = lazy(() => import('@/pages/admin/OrdersList'));
const MerchList = lazy(() => import('@/pages/admin/MerchList'));
const CreateMerch = lazy(() => import('@/pages/admin/CreateMerch'));
const UpdateMerch = lazy(() => import('@/pages/admin/UpdateMerch'));
const ScanPage = lazy(() => import('@/pages/admin/ScanPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/merchandise/:id" element={<MerchDetailPage />} />
            <Route path="/profile" element={<ProfilePage tab="account" />} />
            <Route path="/profile/tickets" element={<ProfilePage tab="items" />} />
            <Route path="/profile/history" element={<ProfilePage tab="history" />} />
            <Route path="/profile/security" element={<ProfilePage tab="security" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/order/:id/ticket" element={<TicketPage />} />

            {/* Admin Routes with Layout Wrapper */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<EventsList />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/edit/:id" element={<UpdateEvent />} />
              <Route path="merchandise" element={<MerchList />} />
              <Route path="merch/create" element={<CreateMerch />} />
              <Route path="merch/edit/:id" element={<UpdateMerch />} />
              <Route path="orders" element={<OrdersList />} />
              <Route path="scan" element={<ScanPage />} />
            </Route>
          </Routes>
        </Suspense>
        <ToastContainer />
      </ToastProvider>
    </Router>
  );
};

export default App;
