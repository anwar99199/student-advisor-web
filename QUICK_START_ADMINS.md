# ⚡ البدء السريع - جدول المديرين
## Quick Start - Admins Table Setup

---

## 🎯 خطوتان فقط!

### الخطوة 1: إنشاء جدول admins

انسخ والصق في Supabase SQL Editor:

```sql
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

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_is_active ON admins(is_active);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON admins FOR ALL USING (true);

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### الخطوة 2: إضافة المديرين

استخدم أداة HTTP (Postman/cURL) أو المتصفح:

```bash
curl -X POST https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/admin/setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGdla2RobHloYW9vcXpkaW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTM1MzUsImV4cCI6MjA4Mzk4OTUzNX0.SEHR9CncEdDGFVgc1Wa7ifYBcwEbABPAPQhA_-toyG4" \
  -d '{"secret_key": "SETUP_ADMINS_2026"}'
```

---

## ✅ انتهى!

الآن يمكنك تسجيل الدخول:

### المدير 1:
```
البريد: as8543245@gmail.com
الرمز: A1999anw#
```

### المدير 2:
```
البريد: anwaralrawahi459@gmail.com
الرمز: 6101999
```

---

## 🔍 التحقق

```sql
SELECT email, name, role, is_active FROM admins;
```

يجب أن تشاهد المديرين مع كلمات مرور **مشفرة**! ✅

---

## 📚 للمزيد:
- `/ADMINS_TABLE_SETUP_GUIDE.md` - دليل شامل
- `/DATABASE_TABLES_SUMMARY.md` - ملخص الجداول

---

**استمتع بالأمان المحسّن! 🛡️**
