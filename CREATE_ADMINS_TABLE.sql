-- ============================================
-- جدول المديرين (Admins Table)
-- ============================================

-- إنشاء جدول المديرين
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- تفعيل Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- سياسة الوصول
CREATE POLICY "Enable all access for service role" ON admins
    FOR ALL USING (true);

-- Trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- إضافة المديرين الأساسيين
-- ============================================

-- ملاحظة: كلمات المرور يجب أن تكون مشفرة (hashed)
-- هذه مجرد أمثلة، سيتم التشفير عبر API

-- المدير الأول: as8543245@gmail.com
-- كلمة المرور: A1999anw#
-- Hash (bcrypt): سيتم إنشاؤه عبر API

-- المدير الثاني: anwaralrawahi459@gmail.com
-- كلمة المرور: 6101999
-- Hash (bcrypt): سيتم إنشاؤه عبر API

-- سيتم إضافة المديرين عبر API endpoint خاص

-- ============================================
-- View لعرض المديرين (بدون كلمات المرور)
-- ============================================

CREATE OR REPLACE VIEW admins_info AS
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    updated_at,
    last_login_at
FROM admins
ORDER BY created_at DESC;

-- ============================================
-- Function للتحقق من نشاط المدير
-- ============================================

CREATE OR REPLACE FUNCTION check_admin_active(admin_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE email = admin_email AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- انتهى
-- ============================================
