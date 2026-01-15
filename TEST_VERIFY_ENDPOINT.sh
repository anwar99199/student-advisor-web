#!/bin/bash

# ==============================================
# اختبار Verify Endpoint
# ==============================================

ENDPOINT="https://ukxgekdhlyhaooqzdime.supabase.co/functions/v1/make-server-c2f27df0/verify"

echo "🧪 اختبار Verify Endpoint"
echo "=================================="
echo ""

# Test 1: كود صحيح ونشط
echo "1️⃣ اختبار: كود صحيح ونشط"
echo "----------------------------"
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST-PREMIUM-2025"}' \
  -w "\nStatus Code: %{http_code}\n"
echo ""
echo ""

# Test 2: كود ناقص
echo "2️⃣ اختبار: بدون كود"
echo "----------------------------"
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus Code: %{http_code}\n"
echo ""
echo ""

# Test 3: كود غير موجود
echo "3️⃣ اختبار: كود غير موجود"
echo "----------------------------"
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"code": "INVALID-CODE-999"}' \
  -w "\nStatus Code: %{http_code}\n"
echo ""
echo ""

# Test 4: اشتراك غير نشط
echo "4️⃣ اختبار: اشتراك غير نشط"
echo "----------------------------"
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"code": "EXPIRED-CODE"}' \
  -w "\nStatus Code: %{http_code}\n"
echo ""
echo ""

echo "=================================="
echo "✅ انتهى الاختبار"
echo ""
echo "ملاحظة: تأكد من إنشاء جدول subscriptions أولاً"
echo "شغل: CREATE_SUBSCRIPTIONS_TABLE.sql في Supabase SQL Editor"
