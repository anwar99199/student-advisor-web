import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/app/components/Navbar';
import { LandingPage } from '@/app/components/LandingPage';
import { LoginPage } from '@/app/components/LoginPage';
import { PricingPage } from '@/app/components/PricingPage';
import { UploadReceiptPage } from '@/app/components/UploadReceiptPage';
import { PrivacyPolicyPage } from '@/app/components/PrivacyPolicyPage';
import { AdminLoginPage } from '@/app/components/AdminLoginPage';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white" dir="rtl">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><LandingPage /></>} />
          <Route path="/login" element={<><Navbar /><LoginPage /></>} />
          <Route path="/register" element={<><Navbar /><LoginPage /></>} />
          <Route path="/pricing" element={<><Navbar /><PricingPage /></>} />
          <Route path="/upload-receipt" element={<><Navbar /><UploadReceiptPage /></>} />
          <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicyPage /></>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}