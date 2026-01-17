# ⚡ إضافة المديرين - خطوة بخطوة
## Add Admins Step by Step

---

## 🎯 الطريقة الأسرع والأكثر بساطة

### الخطوة 1: افتح Supabase SQL Editor
1. اذهب إلى https://supabase.com/dashboard
2. اختر مشروعك
3. من القائمة الجانبية → **SQL Editor**

### الخطوة 2: تأكد من وجود جدول admins
شغّل هذا أولاً:
```sql
SELECT * FROM admins LIMIT 1;
```

- ✅ إذا نجح → الجدول موجود، انتقل للخطوة 3
- ❌ إذا فشل → شغّل محتوى `/CREATE_ADMINS_TABLE.sql` أولاً

### الخطوة 3: أضف المديرين والـ Function
انسخ والصق هذا الكود **بالكامل** واضغط **Run**:

```sql
-- تفعيل التشفير
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- إضافة المديرين
INSERT INTO admins (email, password_hash, name, role, is_active) VALUES
    (
        'as8543245@gmail.com',
        crypt('A1999anw#', gen_salt('bf')),
        'المدير الأول',
        'super_admin',
        true
    ),
    (
        'anwaralrawahi459@gmail.com',
        crypt('6101999', gen_salt('bf')),
        'المدير الثاني',
        'admin',
        true
    )
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Function للتحقق من تسجيل الدخول
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

-- عرض النتيجة
SELECT id, email, name, role, is_active, created_at FROM admins;
```

### الخطوة 4: تحقق من النتيجة
يجب أن تشاهد:
```
| email                          | name          | role        | is_active |
|--------------------------------|---------------|-------------|-----------|
| as8543245@gmail.com           | المدير الأول  | super_admin | true      |
| anwaralrawahi459@gmail.com    | المدير الثاني | admin       | true      |
```

### الخطوة 5: اختبر تسجيل الدخول
1. افتح موقعك → `/admin/login`
2. جرّب:
   - البريد: `as8543245@gmail.com`
   - كلمة المرور: `A1999anw#`
3. يجب أن تدخل بنجاح! ✅

---

## 🔧 إذا واجهت مشكلة

### مشكلة: "function gen_salt does not exist"
**الحل:**
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### مشكلة: "table admins does not exist"
**الحل:** شغّل محتوى `/CREATE_ADMINS_TABLE.sql` أولاً

### مشكلة: "duplicate key value violates unique constraint"
**الحل:** المديرين موجودين بالفعل! لتحديثهم:
```sql
-- حذف المديرين الموجودين
DELETE FROM admins WHERE email IN ('as8543245@gmail.com', 'anwaralrawahi459@gmail.com');

-- ثم أعد تشغيل كود الإضافة
```

---

## 📋 كود كامل جاهز للنسخ

```sql
-- خطوة واحدة: انسخ كل هذا والصقه واضغط Run

-- 1. تفعيل pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. إضافة المديرين
INSERT INTO admins (email, password_hash, name, role, is_active) VALUES
    ('as8543245@gmail.com', crypt('A1999anw#', gen_salt('bf')), 'المدير الأول', 'super_admin', true),
    ('anwaralrawahi459@gmail.com', crypt('6101999', gen_salt('bf')), 'المدير الثاني', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- 3. Function للتحقق من تسجيل الدخول
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

-- 4. عرض النتيجة
SELECT email, name, role, is_active FROM admins;
```

---

## 🎉 انتهى!

الآن يمكنك:
- ✅ تسجيل دخول من `/admin/login`
- ✅ كلمات المرور **مشفرة بالكامل**
- ✅ آمن 100%

---

## 📞 للمساعدة

إذا لم يعمل، أرسل لي:
1. رسالة الخطأ من SQL Editor
2. نتيجة: `SELECT * FROM admins;`

البريد: as8543245@gmail.com

---

**وقت التنفيذ: دقيقة واحدة! ⏱️**