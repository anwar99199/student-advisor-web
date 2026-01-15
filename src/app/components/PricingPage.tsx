import { Link } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Check } from 'lucide-react';

export function PricingPage() {
  const plans = [
    {
      name: 'الباقة الأساسية',
      price: '99',
      period: 'شهرياً',
      description: 'مثالية للطلاب المبتدئين',
      features: [
        'جلسة استشارية واحدة شهرياً',
        'دعم عبر البريد الإلكتروني',
        'الوصول إلى المكتبة التعليمية',
        'تقارير شهرية'
      ],
      popular: false
    },
    {
      name: 'الباقة المميزة',
      price: '249',
      period: 'شهرياً',
      description: 'الأكثر شعبية للطلاب الجادين',
      features: [
        '4 جلسات استشارية شهرياً',
        'دعم عبر الدردشة المباشرة',
        'الوصول الكامل للموارد',
        'جدولة مرنة',
        'تقارير أسبوعية مفصلة',
        'خطة دراسية مخصصة'
      ],
      popular: true
    },
    {
      name: 'الباقة الشاملة',
      price: '499',
      period: 'شهرياً',
      description: 'للحصول على أقصى استفادة',
      features: [
        'جلسات استشارية غير محدودة',
        'دعم على مدار الساعة',
        'مستشار شخصي مخصص',
        'ورش عمل حصرية',
        'استشارات مهنية',
        'متابعة يومية',
        'أولوية في الحجز'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            اختر الباقة المناسبة لك
          </h1>
          <p className="text-xl text-gray-600">
            خطط مرنة تناسب جميع احتياجاتك الأكاديمية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? 'border-blue-500 border-2 shadow-xl scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    الأكثر شعبية
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-gray-500 mr-2">ر.س</span>
                  <span className="text-gray-500">/ {plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link to="/upload-receipt" className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    اختر الباقة
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            هل لديك أسئلة؟ تواصل معنا على البريد الإلكتروني
          </p>
          <a href="mailto:support@student-advisor.com" className="text-blue-600 hover:underline">
            support@student-advisor.com
          </a>
        </div>
      </div>
    </div>
  );
}
