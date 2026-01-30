<img width="1537" height="726" alt="Screenshot 2026-01-30 221647" src="https://github.com/user-attachments/assets/cf108fe6-c3df-4b82-8261-5b99c2a65bd7" /># Laravel HyperPay Payment Gateway Integration (Copy-and-Pay) 💳

![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![HyperPay](https://img.shields.io/badge/HyperPay-v1.0-green?style=for-the-badge)
![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?style=for-the-badge&logo=php&logoColor=white)

مستودع برمجي متكامل يوضح كيفية دمج بوابة دفع **HyperPay** في تطبيقات Laravel باستخدام نمط **Copy-and-Pay**. تم بناء هذا المشروع ليكون مرجعاً للمبرمجين الساعين لتنفيذ حلول دفع آمنة واحترافية.

---

## 🏗️ البنية البرمجية (Architecture)

يعتمد المشروع على **Service Pattern** لفصل منطق الربط عن الـ Controllers، مما يسهل عملية الصيانة والاختبار:

- **Gateway Service:** كلاس `HyperPayGateway` هو المسؤول الوحيد عن التحدث مع HyperPay API.
- **Contract-Based:** استخدام `PaymentGatewayInterface` لضمان مرونة النظام وقابليته للتوسع لإضافة بوابات دفع أخرى مستقبلاً.
- **Transactional Integrity:** استخدام معاملات قاعدة البيانات (Database Transactions) لضمان عدم ضياع أي بيانات مالية.

---

## 🚀 تدفق عملية الدفع (The 3-Step Flow)

تم تطبيق دورة حياة الدفع حسب المعايير الرسمية لـ HyperPay:

1.  **المرحلة الأولى (Prepare Checkout):** يقوم السيرفر بإنشاء طلب دفع واستلام `Checkout ID` فريد.
2.  **المرحلة الثانية (Payment Widget):** يتم حقن الـ Payment Widget في واجهة المستخدم ليقوم العميل بإدخال بيانات بطاقته بأمان.
3.  **المرحلة الثالثة (Verification):** بمجرد عودة العميل، يتم إجراء تحقق (Server-to-Server) للتأكد من حالة العملية قبل تحديث سجلات النظام.

---

## 🛠️ المميزات التقنية (Technical Highlights)

- 🔒 **Security:** دعم خاصية الـ `integrity` لضمان سلامة البيانات من التلاعب.
- 📡 **Webhooks:** معالجة التنبيهات الخلفية لتحديث حالة الطلبات بشكل تلقائي وآمن.
- 📊 **Logging:** نظام تتبع كامل للأخطاء والردود القادمة من البوابة لسهولة الـ Debugging.
- 📱 **Responsive Widget:** واجهة دفع متجاوبة مع كافة الشاشات.

---

## 📂 مكونات المشروع الأساسية

| الملف | الوصف |
| :--- | :--- |
| `app/Services/Billing/Gateways/HyperPayGateway.php` | المحرك الرئيسي للاتصال بـ API هايبر باي |
| `app/Http/Controllers/Payment/PaymentTestController.php` | المتحكم في سير العمليات (Logic Flow) |
| `resources/views/payment.blade.php` | واجهة العرض التي تستضيف نموذج الدفع |
| `routes/web.php` | تعريف مسارات العودة والـ Webhook |

---

## ⚙️ متطلبات التشغيل (Configuration)

أضف الإعدادات التالية في ملف `.env` الخاص بك:

```env
# HyperPay Credentials
HYPERPAY_BASE_URL=[https://eu-test.oppwa.com](https://eu-test.oppwa.com)
HYPERPAY_ENTITY_ID=8a829417...
HYPERPAY_ACCESS_TOKEN=OGE4Mjk0...
HYPERPAY_TEST_MODE=EXTERNAL

ثم قم بتشغيل الأمر التالي لتحديث الإعدادات:
``` php artisan config:clear
---
<img width="1537" height="726" alt="Screenshot 2026-01-30 221647" src="https://github.com/user-attachments/assets/4fa4f7c2-3677-40a8-a0ae-79cae9e1220b" />

---

### 👩‍💻 تطوير وإعداد
## بواسطة المبرمجة: ختام حمدي اخليل

# صدقة جارية عن روح والدي الشهيد حمدي اخليل
 اللهم ارحمه وتقبله في الشهداء واجعل مسكنه الفردوس الأعلى من الجنة
