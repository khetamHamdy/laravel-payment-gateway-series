<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Payment\PaymentTestController;

/*
|--------------------------------------------------------------------------
| Payment Routes (HyperPay Integration)
|--------------------------------------------------------------------------
|
| تم تقسيم المسارات لتغطي دورة حياة الدفع كاملة:
| 1. البداية (Checkout)
| 2. العودة من البوابة (Result)
| 3. التنبيهات الخلفية (Webhook)
|
*/

Route::prefix('test/payment')->group(function () {

    // المسار المسؤول عن إنشاء الـ Checkout ID وبدء العملية
    Route::get('/checkout', [PaymentTestController::class, 'checkout'])->name('payment.checkout');

    /**
     * مسار العودة (Shopper Result URL)
     * ملاحظة: يجب أن يكون GET لأن هايبر باي تقوم بعمل Redirect للمستخدم
     */
    Route::get('/result', [PaymentTestController::class, 'result'])->name('payment.result');

    // صفحة النجاح النهائية للمستخدم
    Route::get('/success', [PaymentTestController::class, 'success'])->name('payment.success');

    /**
     * مسار الـ Webhook (Server-to-Server)
     * ملاحظة: يجب استثناؤه من حماية CSRF في ملف (VerifyCsrfToken.php)
     * لأن هايبر باي ترسل الطلب من سيرفراتها.
     */
    Route::post('/webhook/{gateway}', [PaymentTestController::class, 'webhook'])->name('payment.webhook');

});
