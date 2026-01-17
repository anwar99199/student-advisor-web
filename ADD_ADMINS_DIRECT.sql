-- ============================================
-- إضافة المديرين مباشرة في Supabase
-- ============================================

-- الطريقة 1: باستخدام pgcrypto (الأفضل - تشفير حقيقي)
-- ============================================

-- تفعيل extension pgcrypto للتشفير
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- حذف المديرين الموجودين (إذا كنت تريد البدء من جديد)
-- TRUNCATE TABLE admins;

-- إضافة المديرين مع كلمات مرور مشفرة
INSERT INTO admins (email, password_hash, name, role, is_active) VALUES
    (
        'as8543245@gmail.com',
        crypt('A1999anw#', gen_salt('bf')),  -- تشفير bcrypt
        'المدير الأول',
        'super_admin',
        true
    ),
    (
        'anwaralrawahi459@gmail.com',
        crypt('6101999', gen_salt('bf')),  -- تشفير bcrypt
        'المدير الثاني',
        'admin',
        true
    )
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- التحقق من الإضافة
SELECT id, email, name, role, is_active, created_at FROM admins;

-- ============================================
-- Function للتحقق من تسجيل دخول المدير
-- ============================================

CREATE OR REPLACE FUNCTION verify_admin_login(
    admin_email TEXT,
    admin_password TEXT
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.email,
        a.name,
        a.role,
        a.is_active
    FROM admins a
    WHERE a.email = admin_email
    AND a.is_active = true
    AND a.password_hash = crypt(admin_password, a.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- انتهى
-- ============================================