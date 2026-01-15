-- ============================================
-- إنشاء جدول subscriptions
-- ============================================
-- قم بتشغيل هذا الكود في Supabase Dashboard → SQL Editor

-- 1. إنشاء الجدول
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activation_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  plan TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_activation_code 
ON subscriptions(activation_code);

CREATE INDEX IF NOT EXISTS idx_status 
ON subscriptions(status);

-- 3. إضافة trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at 
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. إضافة بيانات تجريبية (اختياري)
INSERT INTO subscriptions (activation_code, status, plan, expires_at)
VALUES 
  ('TEST-PREMIUM-2025', 'active', 'Premium', '2025-12-31 23:59:59+00'),
  ('TEST-BASIC-2025', 'active', 'Basic', '2025-06-30 23:59:59+00'),
  ('TEST-ENTERPRISE-2026', 'active', 'Enterprise', '2026-12-31 23:59:59+00'),
  ('EXPIRED-CODE', 'inactive', 'Premium', '2024-01-01 23:59:59+00')
ON CONFLICT (activation_code) DO NOTHING;

-- 5. عرض البيانات للتأكد
SELECT * FROM subscriptions ORDER BY created_at DESC;

-- ============================================
-- نهاية السكريبت
-- ============================================

-- ملاحظات:
-- - activation_code: كود التفعيل الفريد
-- - status: حالة الاشتراك (active أو inactive)
-- - plan: اسم الباقة (Premium, Basic, Enterprise, إلخ)
-- - expires_at: تاريخ انتهاء الاشتراك
-- - created_at: تاريخ إنشاء السجل
-- - updated_at: تاريخ آخر تحديث
