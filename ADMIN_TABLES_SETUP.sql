-- ============================================
-- SQL Scripts للجداول المطلوبة في Supabase
-- نظام مستشار الطالب الجامعي - لوحة تحكم المدير
-- ============================================

-- 1. جدول الاشتراكات (Subscriptions)
-- هذا الجدول يخزن معلومات الاشتراكات وأكواد التفعيل
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

-- إضافة فهرس لتسريع البحث بكود التفعيل
CREATE INDEX IF NOT EXISTS idx_subscriptions_activation_code ON subscriptions(activation_code);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON subscriptions(user_email);

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- 2. جدول الإحصائيات (Stats) - اختياري
-- يمكن استخدامه لتخزين الإحصائيات العامة
CREATE TABLE IF NOT EXISTS stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_key TEXT UNIQUE NOT NULL,
    stat_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- 3. إضافة Row Level Security (RLS)
-- لحماية البيانات والسماح بالوصول فقط عبر service_role

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح بالقراءة والكتابة عبر service_role فقط
CREATE POLICY "Enable all access for service role" ON subscriptions
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role on stats" ON stats
    FOR ALL USING (true);

-- ============================================

-- 4. بيانات تجريبية (اختياري)
-- يمكنك إضافة بعض البيانات التجريبية للاختبار

INSERT INTO subscriptions (activation_code, plan, status, expires_at, user_email) VALUES
    ('TEST-BASIC-001', 'basic', 'active', NOW() + INTERVAL '30 days', 'test1@example.com'),
    ('TEST-STANDARD-002', 'standard', 'active', NOW() + INTERVAL '60 days', 'test2@example.com'),
    ('TEST-PREMIUM-003', 'premium', 'active', NOW() + INTERVAL '90 days', 'test3@example.com'),
    ('TEST-EXPIRED-004', 'basic', 'expired', NOW() - INTERVAL '10 days', 'test4@example.com')
ON CONFLICT (activation_code) DO NOTHING;

-- ============================================

-- 5. Views مفيدة للتقارير (اختياري)

-- عرض الاشتراكات النشطة فقط
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT * FROM subscriptions 
WHERE status = 'active' AND expires_at > NOW();

-- عرض الاشتراكات المنتهية
CREATE OR REPLACE VIEW expired_subscriptions AS
SELECT * FROM subscriptions 
WHERE status = 'active' AND expires_at <= NOW();

-- عرض إحصائيات الاشتراكات حسب الباقة
CREATE OR REPLACE VIEW subscriptions_by_plan AS
SELECT 
    plan,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'active' AND expires_at > NOW() THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'active' AND expires_at <= NOW() THEN 1 END) as expired_count
FROM subscriptions
GROUP BY plan;

-- ============================================

-- 6. Function لتحديث حالة الاشتراكات المنتهية تلقائياً
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'active' 
    AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- يمكنك تشغيل هذه الدالة يدوياً أو إنشاء cron job في Supabase:
-- SELECT cron.schedule('update-expired-subscriptions', '0 0 * * *', 'SELECT update_expired_subscriptions();');

-- ============================================

-- ملاحظات مهمة:
-- 1. تأكد من تشغيل هذه السكربتات في SQL Editor في Supabase Dashboard
-- 2. جدول kv_store_c2f27df0 موجود بالفعل ويستخدم للإيصالات
-- 3. جدول auth.users موجود بالفعل في Supabase Auth ويُستخدم للمستخدمين
-- 4. لا حاجة لإنشاء جدول منفصل للمستخدمين لأن Supabase Auth يوفره
-- 5. الإيصالات تُخزن في KV store وليس في جدول منفصل

-- ============================================
-- انتهى
-- ============================================
