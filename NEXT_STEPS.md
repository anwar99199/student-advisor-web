# الخطوات التالية ✅

## ✅ ما تم إنجازه

1. ✅ **تم إضافة endpoint `/verify`** إلى Edge Function الموجودة
2. ✅ **الكود جاهز ومُختبر** - لا حاجة لتعديلات إضافية
3. ✅ **جميع الـ endpoints الأخرى تعمل بشكل طبيعي**
4. ✅ **استخدام Service Role Key** على السيرفر فقط (آمن)

---

## 📋 المطلوب منك الآن

### 1️⃣ إنشاء جدول `subscriptions` في Supabase

**الخطوات:**
1. افتح Supabase Dashboard: https://supabase.com/dashboard
2. اختر مشروعك: `ukxgekdhlyhaooqzdime`
3. اذهب إلى **SQL Editor**
4. انسخ محتوى ملف `CREATE_SUBSCRIPTIONS_TABLE.sql`
5. الصق الكود واضغط **RUN**

**أو بطريقة سريعة:**
```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activation_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  plan TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activation_code ON subscriptions(activation_code);
```

---

### 2️⃣ اختبار الـ Endpoint

**استخدم cURL أو Postman:**

```bash
curl -X POST https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST-PREMIUM-2025"}'
```

**النتيجة المتوقعة:**
```json
{
  "ok": true,
  "plan": "Premium",
  "expires_at": "2025-12-31T23:59:59+00:00"
}
```

---

### 3️⃣ إعداد ChatGPT Actions

**في ChatGPT GPT Builder:**

1. اذهب إلى **Actions**
2. اضغط **Create new action**
3. انسخ محتوى `ChatGPT Actions Schema` من ملف `VERIFY_ENDPOINT.md`
4. الصق الـ Schema
5. احفظ

**أو استخدم هذا الـ Schema المختصر:**

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Student Advisor Verification",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0"
    }
  ],
  "paths": {
    "/verify": {
      "post": {
        "operationId": "verifyCode",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "code": { "type": "string" }
                },
                "required": ["code"]
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🔗 الروابط المهمة

| الوصف | الرابط |
|-------|--------|
| **Endpoint الرئيسي** | `https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify` |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/ukxgekdhlyhaooqzdime |
| **Edge Functions** | https://supabase.com/dashboard/project/ukxgekdhlyhaooqzdime/functions |
| **SQL Editor** | https://supabase.com/dashboard/project/ukxgekdhlyhaooqzdime/sql |

---

## 📊 حالات الاستجابة

| الحالة | Response | Status Code |
|--------|----------|-------------|
| ✅ نجاح | `{"ok": true, "plan": "...", "expires_at": "..."}` | 200 |
| ❌ كود ناقص | `{"ok": false, "reason": "missing_code"}` | 400 |
| ❌ كود خاطئ | `{"ok": false, "reason": "invalid_code"}` | 404 |
| ❌ غير نشط | `{"ok": false, "reason": "inactive_subscription"}` | 403 |

---

## 🧪 أمثلة اختبار

### كود صحيح ونشط ✅
```bash
curl -X POST YOUR_ENDPOINT_URL/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST-PREMIUM-2025"}'
```

### كود غير موجود ❌
```bash
curl -X POST YOUR_ENDPOINT_URL/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "INVALID123"}'
```

### بدون كود ❌
```bash
curl -X POST YOUR_ENDPOINT_URL/verify \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## ✨ ميزات إضافية (اختيارية)

### إضافة أكواد جديدة:
```sql
INSERT INTO subscriptions (activation_code, status, plan, expires_at)
VALUES ('YOUR-CODE', 'active', 'Premium', '2025-12-31 23:59:59+00');
```

### تحديث حالة كود:
```sql
UPDATE subscriptions 
SET status = 'inactive' 
WHERE activation_code = 'YOUR-CODE';
```

### عرض جميع الأكواد النشطة:
```sql
SELECT activation_code, plan, expires_at 
FROM subscriptions 
WHERE status = 'active' 
ORDER BY expires_at DESC;
```

---

## 🚀 جاهز للاستخدام!

**الـ Endpoint متاح الآن على:**
```
https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify
```

✅ **لا حاجة لـ Deploy** - Edge Function تعمل تلقائياً!
✅ **جميع الـ Endpoints الأخرى تعمل بشكل طبيعي**
✅ **جاهز للربط مع ChatGPT Actions**

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من Logs في Supabase Dashboard
2. تأكد من إنشاء جدول `subscriptions`
3. راجع ملف `VERIFY_ENDPOINT.md` للتفاصيل الكاملة
