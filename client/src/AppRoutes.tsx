import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Common Pages
import Home from './pages/common/Home';
import GigBrowse from './pages/common/GigBrowse';
import GigDetail from './pages/common/GigDetail';
import FreelancerProfile from './pages/common/FreelancerProfile';
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProjectTracker from './pages/common/ProjectTracker';
import VideoRoom from './pages/common/VideoRoom';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import PostGig from './pages/client/PostGig';
import ManageGigs from './pages/client/ManageGigs';
import EditGig from './pages/client/EditGig';
import GigProposals from './pages/client/GigProposals';
import ClientPayments from './pages/client/ClientPayments';

// Freelancer Pages
import FreelancerDashboard from './pages/freelancer/FreelancerDashboard';
import MyProfile from './pages/freelancer/MyProfile';
import MyProposals from './pages/freelancer/MyProposals';
import FreelancerEarnings from './pages/freelancer/FreelancerEarnings';
import FreelancerAnalytics from './pages/freelancer/FreelancerAnalytics';
import AIGigMatches from './pages/freelancer/AIGigMatches';

// Chat
import ChatPage from './pages/chat/ChatPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminGigs from './pages/admin/AdminGigs';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminVerification from './pages/admin/AdminVerification';

// Fallback
import NotFound from './pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/gigs" element={<GigBrowse />} />
      <Route path="/gigs/:id" element={<GigDetail />} />
      <Route path="/gigs/:id/tracker" element={<ProtectedRoute><ProjectTracker /></ProtectedRoute>} />
      <Route path="/freelancer/:id" element={<FreelancerProfile />} />

      {/* Shared Protected */}
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/room/:roomId" element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/client/gigs" element={<ProtectedRoute allowedRoles={['client']}><ManageGigs /></ProtectedRoute>} />
      <Route path="/client/gigs/new" element={<ProtectedRoute allowedRoles={['client']}><PostGig /></ProtectedRoute>} />
      <Route path="/client/gigs/:id/edit" element={<ProtectedRoute allowedRoles={['client']}><EditGig /></ProtectedRoute>} />
      <Route path="/client/gigs/:id/proposals" element={<ProtectedRoute allowedRoles={['client']}><GigProposals /></ProtectedRoute>} />
      <Route path="/client/payments" element={<ProtectedRoute allowedRoles={['client']}><ClientPayments /></ProtectedRoute>} />

      {/* Freelancer Routes */}
      <Route path="/freelancer/dashboard" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>} />
      <Route path="/freelancer/profile" element={<ProtectedRoute allowedRoles={['freelancer']}><MyProfile /></ProtectedRoute>} />
      <Route path="/freelancer/proposals" element={<ProtectedRoute allowedRoles={['freelancer']}><MyProposals /></ProtectedRoute>} />
      <Route path="/freelancer/earnings" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerEarnings /></ProtectedRoute>} />
      <Route path="/freelancer/analytics" element={<ProtectedRoute allowedRoles={['freelancer']}><FreelancerAnalytics /></ProtectedRoute>} />
      <Route path="/freelancer/matches" element={<ProtectedRoute allowedRoles={['freelancer']}><AIGigMatches /></ProtectedRoute>} />
      <Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/gigs" element={<ProtectedRoute allowedRoles={['admin']}><AdminGigs /></ProtectedRoute>} />
      <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><AdminDisputes /></ProtectedRoute>} />
      <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={['admin']}><AdminVerification /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
