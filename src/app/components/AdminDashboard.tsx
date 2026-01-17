import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { 
  Users, 
  FileText, 
  CreditCard, 
  LogOut, 
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Subscription {
  id: string;
  activation_code: string;
  plan: string;
  status: string;
  expires_at: string;
  created_at: string;
  user_email?: string;
}

interface Receipt {
  id: string;
  userEmail: string;
  fileName: string;
  plan: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingReceipts: number;
  totalUsers: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pendingReceipts: 0,
    totalUsers: 0
  });
  const [searchCode, setSearchCode] = useState('');

  // New subscription form
  const [newSub, setNewSub] = useState({
    email: '',
    plan: 'basic',
    duration: '30'
  });

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubscriptions(),
        loadReceipts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c2f27df0/admin/subscriptions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load subscriptions');

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      
      // Calculate stats
      const active = data.subscriptions?.filter((s: Subscription) => s.status === 'active').length || 0;
      setStats(prev => ({
        ...prev,
        totalSubscriptions: data.subscriptions?.length || 0,
        activeSubscriptions: active
      }));
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadReceipts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c2f27df0/admin/receipts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load receipts');

      const data = await response.json();
      setReceipts(data.receipts || []);
      
      const pending = data.receipts?.filter((r: Receipt) => r.status === 'pending').length || 0;
      setStats(prev => ({
        ...prev,
        pendingReceipts: pending
      }));
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const createSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c2f27df0/admin/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newSub)
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create subscription');

      toast.success(`تم إنشاء الاشتراك بنجاح! كود التفعيل: ${data.activation_code}`);
      setNewSub({ email: '', plan: 'basic', duration: '30' });
      loadSubscriptions();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error(error.message || 'فشل إنشاء الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  const updateReceiptStatus = async (receiptId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c2f27df0/admin/update-receipt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ receiptId, status })
        }
      );

      if (!response.ok) throw new Error('Failed to update receipt');

      toast.success(`تم ${status === 'approved' ? 'قبول' : 'رفض'} الإيصال`);
      loadReceipts();
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('فشل تحديث حالة الإيصال');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    toast.success('تم تسجيل الخروج');
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'نشط' },
      expired: { variant: 'destructive', label: 'منتهي' },
      pending: { variant: 'secondary', label: 'قيد المراجعة' },
      approved: { variant: 'default', label: 'مقبول' },
      rejected: { variant: 'destructive', label: 'مرفوض' }
    };

    const config = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredSubscriptions = searchCode
    ? subscriptions.filter(s => s.activation_code.includes(searchCode))
    : subscriptions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المدير</h1>
              <p className="text-gray-600">{localStorage.getItem('adminEmail')}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الاشتراكات</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الاشتراكات النشطة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الإيصالات قيد المراجعة</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingReceipts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
            <TabsTrigger value="receipts">الإيصالات</TabsTrigger>
            <TabsTrigger value="create">إنشاء اشتراك</TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة الاشتراكات</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="بحث بكود التفعيل..."
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      className="w-64"
                      dir="ltr"
                    />
                    <Button onClick={loadSubscriptions} variant="outline">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSubscriptions.length === 0 ? (
                    <Alert>
                      <AlertDescription>لا توجد اشتراكات حالياً</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right p-3">كود التفعيل</th>
                            <th className="text-right p-3">الباقة</th>
                            <th className="text-right p-3">البريد الإلكتروني</th>
                            <th className="text-right p-3">الحالة</th>
                            <th className="text-right p-3">تاريخ الانتهاء</th>
                            <th className="text-right p-3">تاريخ الإنشاء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubscriptions.map((sub) => (
                            <tr key={sub.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-mono text-sm" dir="ltr">{sub.activation_code}</td>
                              <td className="p-3">{sub.plan}</td>
                              <td className="p-3" dir="ltr">{sub.user_email || '-'}</td>
                              <td className="p-3">{getStatusBadge(sub.status)}</td>
                              <td className="p-3">{new Date(sub.expires_at).toLocaleDateString('ar-SA')}</td>
                              <td className="p-3">{new Date(sub.created_at).toLocaleDateString('ar-SA')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مراجعة الإيصالات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receipts.length === 0 ? (
                    <Alert>
                      <AlertDescription>لا توجد إيصالات حالياً</AlertDescription>
                    </Alert>
                  ) : (
                    receipts.map((receipt) => (
                      <Card key={receipt.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">{receipt.fileName}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>البريد: {receipt.userEmail}</p>
                              <p>الباقة: {receipt.plan}</p>
                              <p>المبلغ: {receipt.amount} ريال</p>
                              <p>التاريخ: {new Date(receipt.createdAt).toLocaleString('ar-SA')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {receipt.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateReceiptStatus(receipt.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 ml-1" />
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateReceiptStatus(receipt.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 ml-1" />
                                  رفض
                                </Button>
                              </>
                            ) : (
                              getStatusBadge(receipt.status)
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Subscription Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء اشتراك جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createSubscription} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newSub.email}
                      onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan">الباقة</Label>
                    <Select value={newSub.plan} onValueChange={(value) => setNewSub({ ...newSub, plan: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">أساسية - 40 ريال</SelectItem>
                        <SelectItem value="standard">قياسية - 60 ريال</SelectItem>
                        <SelectItem value="premium">مميزة - 100 ريال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">المدة (بالأيام)</Label>
                    <Select value={newSub.duration} onValueChange={(value) => setNewSub({ ...newSub, duration: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 يوم (شهر)</SelectItem>
                        <SelectItem value="90">90 يوم (3 أشهر)</SelectItem>
                        <SelectItem value="180">180 يوم (6 أشهر)</SelectItem>
                        <SelectItem value="365">365 يوم (سنة)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Plus className="w-4 h-4 ml-2" />
                    {loading ? 'جاري الإنشاء...' : 'إنشاء الاشتراك'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
