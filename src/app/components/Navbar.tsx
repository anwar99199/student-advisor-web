import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { GraduationCap, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = supabase.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const user = supabase.getStoredUser();
        setUserName(user?.name || user?.email || '');
      }
    };

    checkAuth();
    // Check auth status on storage change (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = async () => {
    await supabase.signOut();
    setIsAuthenticated(false);
    setUserName('');
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">مستشار الطالب الجامعي</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost">التسعير</Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{userName}</span>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">تسجيل الدخول</Button>
                </Link>
                <Link to="/register">
                  <Button>التسجيل</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}