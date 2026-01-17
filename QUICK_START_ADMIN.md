# ⚡ البدء السريع - نظام المدير
## Quick Start Guide - 5 Minutes Setup

---

## 🎯 خطوة واحدة فقط!

### انسخ والصق هذا السكربت في Supabase SQL Editor:

```sql
-- إنشاء جدول الاشتراكات
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_code TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('basic', 'standard', 'premium')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL,
    user_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة الفهارس
CREATE INDEX idx_subscriptions_activation_code ON subscriptions(activation_code);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_user_email ON subscriptions(user_email);

-- تفعيل الأمان
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON subscriptions FOR ALL USING (true);

-- بيانات تجريبية (اختياري)
INSERT INTO subscriptions (activation_code, plan, status, expires_at, user_email) VALUES
    ('TEST-BASIC-001', 'basic', 'active', NOW() + INTERVAL '30 days', 'test@example.com')
ON CONFLICT (activation_code) DO NOTHING;
```

---

## ✅ انتهى! الآن يمكنك:

### 1️⃣ تسجيل الدخول
```
الرابط: /admin/login

حساب 1:
البريد: as8543245@gmail.com
الرمز: A1999anw#

حساب 2:
البريد: anwaralrawahi459@gmail.com
الرمز: 6101999
```

### 2️⃣ استخدام لوحة التحكم
- 📊 عرض الإحصائيات
- 🎫 إدارة الاشتراكات
- 📄 مراجعة الإيصالات
- ➕ إنشاء اشتراكات جديدة

---

## 🧪 اختبار سريع

### إنشاء اشتراك تجريبي:
1. افتح `/admin/dashboard`
2. اذهب إلى تبويب "إنشاء اشتراك"
3. اختر الباقة والمدة
4. اضغط "إنشاء الاشتراك"
5. **انسخ كود التفعيل!**

### اختبار كود التفعيل:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-c2f27df0/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_ACTIVATION_CODE"}'
```

---

## 📚 للمزيد من التفاصيل:
- `/ADMIN_SETUP_GUIDE.md` - دليل شامل
- `/DATABASE_TABLES_SUMMARY.md` - تفاصيل الجداول
- `/ADMIN_FINAL_SUMMARY.md` - ملخص كامل

---

**هذا كل شيء! استمتع بالاستخدام 🎉**
