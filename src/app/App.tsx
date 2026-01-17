import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/app/components/Navbar';
import { LandingPage } from '@/app/components/LandingPage';
import { LoginPage } from '@/app/components/LoginPage';
import { PricingPage } from '@/app/components/PricingPage';
import { UploadReceiptPage } from '@/app/components/UploadReceiptPage';
import { PrivacyPolicyPage } from '@/app/components/PrivacyPolicyPage';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white" dir="rtl">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/upload-receipt" element={<UploadReceiptPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}