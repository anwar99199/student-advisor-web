-- ============================================
-- جدول المستخدمين (Users Table)
-- ============================================

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    subscription_plan TEXT CHECK (subscription_plan IN ('basic', 'premium', 'none')),
    subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('active', 'expired', 'none')),
    activation_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- تفعيل Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسة الوصول
CREATE POLICY "Enable all access for service role" ON users
    FOR ALL USING (true);

-- Trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- بيانات تجريبية (اختياري)
-- ============================================

INSERT INTO users (email, name, subscription_plan, subscription_status) VALUES
    ('test@example.com', 'مستخدم تجريبي', 'premium', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- View لعرض المستخدمين مع معلومات Auth
-- ============================================

CREATE OR REPLACE VIEW users_full_info AS
SELECT 
    u.id,
    u.auth_user_id,
    u.email,
    u.name,
    u.phone,
    u.subscription_plan,
    u.subscription_status,
    u.activation_code,
    u.created_at,
    u.updated_at,
    u.last_login_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- انتهى
-- ============================================
