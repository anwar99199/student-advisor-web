# Verify Endpoint - توثيق

## معلومات الـ Endpoint

**URL:** `https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify`

**Method:** `POST`

**Content-Type:** `application/json`

**الغرض:** التحقق من activation codes للاشتراكات (مخصص لـ ChatGPT Actions)

---

## Request Format

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "code": "activation_code_here"
}
```

---

## Response Cases

### ✅ 1. نجاح - كود صحيح واشتراك نشط
**Status Code:** `200 OK`

```json
{
  "ok": true,
  "plan": "Premium",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

---

### ❌ 2. كود غير موجود
**Status Code:** `400 Bad Request`

```json
{
  "ok": false,
  "reason": "missing_code"
}
```

---

### ❌ 3. كود غير صحيح
**Status Code:** `404 Not Found`

```json
{
  "ok": false,
  "reason": "invalid_code"
}
```

---

### ❌ 4. اشتراك غير نشط
**Status Code:** `403 Forbidden`

```json
{
  "ok": false,
  "reason": "inactive_subscription"
}
```

---

### ❌ 5. خطأ في السيرفر
**Status Code:** `500 Internal Server Error`

```json
{
  "ok": false,
  "reason": "server_error",
  "message": "error details"
}
```

---

## متطلبات قاعدة البيانات

### جدول `subscriptions`

يجب إنشاء الجدول في Supabase Dashboard:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activation_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  plan TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء index للبحث السريع
CREATE INDEX idx_activation_code ON subscriptions(activation_code);
```

---

## أمثلة الاستخدام

### مثال 1: استخدام cURL

```bash
curl -X POST https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "ABC123XYZ"}'
```

### مثال 2: استخدام JavaScript/Fetch

```javascript
const response = await fetch(
  'https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: 'ABC123XYZ'
    })
  }
);

const result = await response.json();
console.log(result);
```

### مثال 3: ChatGPT Actions Schema

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Student Advisor Verification API",
    "description": "API للتحقق من activation codes للاشتراكات",
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
        "description": "التحقق من كود التفعيل",
        "operationId": "verifyActivationCode",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "code": {
                    "type": "string",
                    "description": "كود التفعيل"
                  }
                },
                "required": ["code"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "نجاح - الكود صحيح والاشتراك نشط",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "ok": {
                      "type": "boolean"
                    },
                    "plan": {
                      "type": "string"
                    },
                    "expires_at": {
                      "type": "string",
                      "format": "date-time"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "كود غير موجود"
          },
          "404": {
            "description": "كود غير صحيح"
          },
          "403": {
            "description": "اشتراك غير نشط"
          }
        }
      }
    }
  }
}
```

---

## الأمان

✅ **المميزات الأمنية:**
- استخدام `SUPABASE_SERVICE_ROLE_KEY` على السيرفر فقط
- عدم كشف أي مفاتيح في Frontend
- CORS مفعل للسماح بـ ChatGPT Actions
- Logging لجميع المحاولات

---

## Testing

### إضافة بيانات تجريبية:

```sql
-- في Supabase SQL Editor
INSERT INTO subscriptions (activation_code, status, plan, expires_at)
VALUES 
  ('TEST123', 'active', 'Premium', '2025-12-31 23:59:59+00'),
  ('DEMO456', 'inactive', 'Basic', '2024-12-31 23:59:59+00'),
  ('VALID789', 'active', 'Enterprise', '2026-06-30 23:59:59+00');
```

### اختبار الـ Endpoint:

```bash
# اختبار كود صحيح ونشط
curl -X POST https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST123"}'

# اختبار كود غير موجود
curl -X POST https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "INVALID"}'

# اختبار اشتراك غير نشط
curl -X POST https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "DEMO456"}'
```

---

## ملاحظات مهمة

1. **Edge Function تعمل بالفعل** - لا حاجة لإعادة deploy يدوياً، التغييرات تُطبق تلقائياً
2. **الجدول `subscriptions` يجب إنشاؤه يدوياً** في Supabase Dashboard
3. **الـ Service Role Key محمي** ولا يظهر في أي استجابة
4. **جميع الـ endpoints الأخرى تعمل بشكل طبيعي** ولم تتأثر

---

## الرابط النهائي

```
https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify
```

✅ **جاهز للاستخدام مع ChatGPT Actions!**
