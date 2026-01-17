import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const ADMIN_CREDENTIALS = [
    { email: 'as8543245@gmail.com', password: 'A1999anw#' },
    { email: 'anwaralrawahi459@gmail.com', password: '6101999' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if credentials match admin accounts
      const isAdmin = ADMIN_CREDENTIALS.some(
        admin => admin.email === email && admin.password === password
      );

      if (!isAdmin) {
        setError('بيانات الدخول غير صحيحة أو أنك لست مديراً');
        setLoading(false);
        return;
      }

      // Store admin session
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminLoginTime', new Date().toISOString());

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            لوحة تحكم المدير
          </CardTitle>
          <p className="text-gray-600">Admin Control Panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="text-left"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>⚠️ صفحة خاصة بالمديرين فقط</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
