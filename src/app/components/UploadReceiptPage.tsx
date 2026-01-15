import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function UploadReceiptPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [plan] = useState('الباقة المميزة'); // Can be passed from pricing page
  const [amount] = useState('249');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploaded(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Check if user is authenticated
    if (!supabase.isAuthenticated()) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    setUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        await supabase.uploadReceipt(
          selectedFile.name,
          base64Data,
          plan,
          amount
        );
        
        setUploading(false);
        setUploaded(true);
        toast.success('تم رفع الإيصال بنجاح!');
      };
      
      reader.onerror = () => {
        setUploading(false);
        toast.error('فشل قراءة الملف');
      };
    } catch (error: any) {
      setUploading(false);
      toast.error(error.message || 'فشل رفع الإيصال');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              رفع إيصال الدفع
            </h1>
            <p className="text-xl text-gray-600">
              قم بتحميل إيصال التحويل البنكي لتفعيل اشتراكك
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات التحويل البنكي</CardTitle>
              <CardDescription>
                يرجى التحويل إلى الحساب التالي ثم رفع إيصال التحويل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">اسم البنك:</span>
                  <span>البنك الأهلي السعودي</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">رقم الحساب:</span>
                  <span className="font-mono">SA12 3456 7890 1234 5678</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">اسم المستفيد:</span>
                  <span>مستشار الطالب الجامعي</span>
                </div>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="receipt">إيصال التحويل</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="receipt"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {selectedFile ? (
                        <>
                          <FileText className="h-12 w-12 text-blue-500 mb-2" />
                          <p className="text-sm font-medium text-gray-700">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700">
                            اضغط لاختيار الملف
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, PDF حتى 10MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {uploaded && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">تم رفع الإيصال بنجاح!</p>
                      <p className="text-sm text-green-700">
                        سيتم مراجعة الإيصال وتفعيل اشتراكك خلال 24 ساعة
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!selectedFile || uploading || uploaded}
                >
                  {uploading ? 'جاري الرفع...' : uploaded ? 'تم الرفع' : 'رفع الإيصال'}
                </Button>
              </form>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  <strong>ملاحظة:</strong> سيتم مراجعة الإيصال والتحقق من الدفع خلال 24 ساعة عمل.
                  سيتم إرسال رسالة تأكيد على بريدك الإلكتروني عند تفعيل الاشتراك.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}