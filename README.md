# Laravel Moyasar Payment Gateway Implementation 💳

![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Moyasar](https://img.shields.io/badge/Moyasar-API_V1-blue?style=for-the-badge)

مستودع تعليمي يوضح كيفية دمج بوابة دفع **Moyasar (ميسر)** في تطبيقات Laravel باستخدام بنية برمجية نظيفة (Clean Architecture) تعتمد على الـ **Service Pattern**.

---

## 🚀 تدفق عملية الدفع (Payment Flow)

يعتمد هذا المشروع على هيكلية قوية تضمن أمان العمليات المالية عبر المراحل التالية:



1.  **Checkout:** يتم إنشاء سجل دفع محلي بوضع `pending` في قاعدة البيانات، ثم طلب إنشاء فاتورة (Invoice) من ميسر.
2.  **Redirection:** يتم توجيه العميل إلى رابط الفاتورة المولد من بوابة ميسر لإتمام عملية الدفع.
3.  **Validation:** عند العودة (`Success Page`) أو عبر الـ `Webhook` يتم التحقق المباشر من سيرفر ميسر عبر الـ API قبل تحديث حالة الطلب لضمان عدم تلاعب المستخدم بالبيانات.

---

## 🛠️ المميزات التقنية (Technical Features)

* ✅ **Service-Oriented Architecture:** فصل منطق بوابة الدفع بالكامل داخل `MoyasarGateway` بعيداً عن الكنترولر.
* ✅ **Database Transactions:** استخدام `DB::transaction` مع `lockForUpdate` عند تحديث حالة الدفع لمنع الـ Race Conditions.
* ✅ **Double Verification:** التحقق من حالة الدفع عبر استدعاء API ميسر مباشرة من السيرفر (Server-to-Server) لضمان الأمان العالي.
* ✅ **Robust Logging:** نظام تسجيل أحداث (Logging) دقيق لكل مرحلة من مراحل الدفع لتسهيل عملية التتبع (Debugging).

---

## 📂 الهيكل البرمجي (Key Components)

### 1️⃣ المسارات (Routes)
تم تنظيم المسارات باستخدام `prefix` لتسهيل الاختبار والوصول:
* `GET /test/payment/checkout`: لبدء المعاملة وإنشاء الرابط.
* `POST /test/payment/webhook/{gateway}`: لاستقبال الإشعارات التلقائية من ميسر.
* `GET /test/payment/success`: لمعالجة عودة العميل وتأكيد حالة الدفع النهائية.

### 2️⃣ المتحكم (PaymentTestController)
المسؤول عن التنسيق بين واجهة المستخدم، الخدمة (Service)، وقاعدة البيانات، مع ضمان معالجة الأخطاء بشكل سليم.

### 3️⃣ الخدمة (MoyasarGateway)
المحرك الرئيسي الذي يتواصل مع API ميسر، ويقوم ببناء الـ Payload، ومعالجة الـ Webhooks، وتوحيد استجابة النظام.

---

## ⚙️ الإعدادات (.env)

يتم جلب الإعدادات برمجياً من ملف `config/services.php`. تأكد من إضافة القيم التالية في ملف الـ `.env`:

```env
# Moyasar Configuration
MOYASAR_API_URL=[https://api.moyasar.com/v1](https://api.moyasar.com/v1)
MOYASAR_API_KEY=pk_test_... # المفتاح العام (Publishable Key)
MOYASAR_SECRET_KEY=sk_test_... # المفتاح السري (Secret Key)
```
---

### 👩‍💻 تطوير وإعداد
## بواسطة المبرمجة: ختام حمدي اخليل

# صدقة جارية عن روح والدي الشهيد حمدي اخليل
 اللهم ارحمه وتقبله في الشهداء واجعل مسكنه الفردوس الأعلى من الجنة
