import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BookOpen, Calendar, MessageCircle, Award } from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'استشارات أكاديمية',
      description: 'احصل على نصائح مخصصة لتخطيط مسارك الدراسي وتحقيق أهدافك الأكاديمية'
    },
    {
      icon: Calendar,
      title: 'جدولة مرنة',
      description: 'احجز جلسات استشارية في الوقت المناسب لك مع مستشارين متخصصين'
    },
    {
      icon: MessageCircle,
      title: 'دعم مباشر',
      description: 'تواصل مع المستشارين عبر الدردشة المباشرة والحصول على إجابات فورية'
    },
    {
      icon: Award,
      title: 'خبرة متخصصة',
      description: 'مستشارون ذوو خبرة في مختلف المجالات الأكاديمية والمهنية'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              مستشارك الأكاديمي الموثوق
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              احصل على إرشاد متخصص لمساعدتك في رحلتك الجامعية وتحقيق التميز الأكاديمي
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8">
                  ابدأ الآن
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  عرض الباقات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            لماذا تختار مستشار الطالب الجامعي؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            جاهز لبدء رحلتك نحو التميز؟
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            انضم إلى آلاف الطلاب الذين حققوا أهدافهم الأكاديمية معنا
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              سجل مجاناً الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
            <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <span className="hidden md:inline text-gray-600">|</span>
            <a href="mailto:as8543245@gmail.com" className="text-gray-300 hover:text-white transition-colors">
              اتصل بنا
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} مستشار الطالب الجامعي. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}