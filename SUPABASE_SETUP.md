# إعداد Supabase - مستشار الطالب الجامعي

## نظرة عامة

تم ربط الموقع بنجاح مع Supabase! النظام يستخدم:
- **Supabase Auth** لإدارة المستخدمين
- **Edge Functions** للـ Backend API
- **KV Store** لتخزين الإيصالات

## المميزات المتوفرة

### 1. نظام المصادقة (Authentication)
- ✅ التسجيل (Sign Up)
- ✅ تسجيل الدخول (Sign In)
- ✅ تسجيل الخروج (Sign Out)
- ✅ حماية الصفحات

### 2. رفع الإيصالات
- ✅ رفع الإيصالات (PDF, PNG, JPG)
- ✅ تخزين معلومات الإيصال
- ✅ ربط الإيصالات بالمستخدمين

### 3. API Endpoints المتاحة

#### المصادقة
```
POST /make-server-c2f27df0/signup
Body: { email, password, name }
```

```
POST /make-server-c2f27df0/signin
Body: { email, password }
```

#### معلومات المستخدم
```
GET /make-server-c2f27df0/me
Headers: { Authorization: Bearer <access_token> }
```

#### الإيصالات
```
POST /make-server-c2f27df0/upload-receipt
Headers: { Authorization: Bearer <access_token> }
Body: { fileName, fileData, plan, amount }
```

```
GET /make-server-c2f27df0/receipts
Headers: { Authorization: Bearer <access_token> }
```

## كيفية الاستخدام

### 1. إنشاء حساب جديد
1. اذهب إلى صفحة `/register`
2. املأ البيانات (الاسم، البريد الإلكتروني، كلمة المرور)
3. اضغط "إنشاء حساب"

### 2. تسجيل الدخول
1. اذهب إلى صفحة `/login`
2. أدخل البريد الإلكتروني وكلمة المرور
3. اضغط "تسجيل الدخول"

### 3. رفع إيصال
1. سجل دخولك أولاً
2. اذهب إلى صفحة `/upload-receipt`
3. اختر ملف الإيصال (PDF أو صورة)
4. اضغط "رفع الإيصال"

## البنية التقنية

### Frontend (`/src`)
- `lib/supabase.ts` - مكتبة للتواصل مع API
- المكونات تستخدم هذه المكتبة مباشرة

### Backend (`/supabase/functions/server`)
- `index.tsx` - الـ Routes الرئيسية
- `auth.tsx` - وظائف المصادقة
- `kv_store.tsx` - تخزين البيانات (محمي)

## التخزين

### KV Store Structure
```
receipt:{id} -> {
  id, userId, userEmail, fileName, 
  fileData, plan, amount, status, createdAt
}

user:{userId}:receipts -> [receiptId1, receiptId2, ...]
```

## الأمان

- ✅ جميع routes المحمية تتطلب Access Token
- ✅ البريد الإلكتروني يتم تأكيده تلقائياً (email_confirm: true)
- ✅ CORS مفعل للسماح بالطلبات من أي مصدر
- ✅ الـ Service Role Key لا يتسرب للـ Frontend أبداً

## ملاحظات مهمة

1. **إعداد خادم البريد الإلكتروني**: حالياً البريد الإلكتروني يتم تأكيده تلقائياً. لإرسال بريد تأكيد حقيقي، يجب إعداد خادم SMTP في Supabase.

2. **تخزين الملفات**: حالياً الإيصالات تُخزن كـ Base64 في KV Store. للمشاريع الكبيرة، يُنصح باستخدام Supabase Storage.

3. **Session Management**: الـ Access Token يُخزن في localStorage ويستمر حتى تسجيل الخروج.

## التطوير المستقبلي

- [ ] إضافة Supabase Storage لتخزين الملفات
- [ ] لوحة تحكم للمشرف لمراجعة الإيصالات
- [ ] إرسال إشعارات البريد الإلكتروني
- [ ] نظام الباقات والاشتراكات
- [ ] تقارير ولوحة معلومات المستخدم
