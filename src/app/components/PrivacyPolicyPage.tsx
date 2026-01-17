import { Card, CardContent } from '@/app/components/ui/card';
import { Mail } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                سياسة الخصوصية
              </h1>
              <p className="text-xl text-gray-600">
                Privacy Policy
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="space-y-8 text-right">
              {/* Arabic Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  نظرة عامة
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    تم تصميم هذا النظام لمساعدة المستخدمين من خلال تقديم استجابات معلوماتية.
                  </p>
                  <p>
                    لا يتم تخزين أو بيع أو مشاركة أي بيانات شخصية مع أطراف ثالثة.
                  </p>
                  <p>
                    يتم استخدام أي بيانات يتم إرسالها عبر العمليات (طلبات API) فقط لتنفيذ العملية المطلوبة ولا يتم الاحتفاظ بها.
                  </p>
                  <p>
                    لا يقوم هذا النظام بجمع معلومات شخصية حساسة.
                  </p>
                </div>
              </section>

              <div className="border-t border-gray-200 my-8"></div>

              {/* English Section */}
              <section dir="ltr" className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Privacy Policy
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                  <p>
                    This GPT is designed to assist users by providing informational responses.
                  </p>
                  <p>
                    No personal data is stored, sold, or shared with third parties.
                  </p>
                  <p>
                    Any data sent through actions (API requests) is used only to fulfill the requested operation and is not retained.
                  </p>
                  <p>
                    This GPT does not collect sensitive personal information.
                  </p>
                </div>
              </section>

              <div className="border-t border-gray-200 my-8"></div>

              {/* Contact Section */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  للاستفسارات والتواصل
                </h2>
                <p className="text-center text-gray-700 mb-4">
                  If you have questions, contact:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <a 
                    href="mailto:as8543245@gmail.com"
                    className="text-lg text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    as8543245@gmail.com
                  </a>
                </div>
              </section>

              {/* Footer Note */}
              <div className="text-center text-sm text-gray-500 mt-8">
                <p>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
                <p className="mt-1" dir="ltr">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
