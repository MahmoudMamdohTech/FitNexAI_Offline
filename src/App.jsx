import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — Public
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Verify from './pages/auth/Verify';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Setup from './pages/onboarding/Setup';
import Review from './pages/onboarding/Review';
import Confirming from './pages/onboarding/Confirming';
import NotFound from './pages/NotFound';

// Pages — Dashboard (protected)
import DashboardHome from './pages/dashboard/DashboardHome';
import AiCamera from './pages/dashboard/AiCamera';
import CodePage from './pages/dashboard/CodePage';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0a1a0a', color: '#ff4444', padding: '40px', height: '100vh', fontFamily: 'monospace' }}>
          <h1>Fatal Error</h1>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ background: '#39ff14', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes — with Navbar/Footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/review" element={<Review />} />
            <Route path="/confirming" element={<Confirming />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="ai-camera" element={<AiCamera />} />
              <Route path="code" element={<CodePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
