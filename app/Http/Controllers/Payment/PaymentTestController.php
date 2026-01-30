<?php

namespace App\Http\Controllers\Payment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Billing\Gateways\HyperPayGateway;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * PaymentTestController
 * * المتحكم المسؤول عن اختبار دورة دفع HyperPay الكاملة.
 * يشمل: طلب الدفع، استقبال العميل بعد الدفع، ومعالجة التنبيهات الخلفية (Webhooks).
 */
class PaymentTestController extends Controller
{
    /**
     * الخطوة 1: بدء عملية الدفع (Checkout)
     * * تنشئ سجلاً في قاعدة البيانات وتطلب Checkout ID من هايبر باي.
     */
    public function checkout(HyperPayGateway $gateway)
    {
        // 1. إنشاء سجل المعاملة محلياً بحالة 'pending'
        $payment = Payment::create([
            'user_id'  => Auth::id() ?? 1, // تجريبي: نستخدم ID 1 إذا لم يكن هناك تسجيل دخول
            'amount'   => 100.00,
            'currency' => 'SAR',
            'gateway'  => 'hyperpay',
            'status'   => 'pending',
        ]);

        // 2. تجهيز البيانات المطلوبة للبوابة
        $payload = [
            'amount'     => $payment->amount,
            'currency'   => $payment->currency,
            // نمرر الـ payment_id في الرابط لنعرف أي طلب نحدث عند العودة
            'result_url' => route('payment.result', ['payment_id' => $payment->id]),
        ];

        // 3. الاتصال بـ HyperPay (Step 1 الرسمي في التوثيق)
        $response = $gateway->createCheckout(
            customer: Auth::user(),
            product: null,
            transaction: $payment,
            options: ['payload' => $payload]
        );


        if (!$response['success']) {
            return response()->json([
                'error_from_gateway' => $response['error'] ?? 'Unknown Error',
                'full_response' => $response['raw'] ?? 'No raw data'
            ], 400);
        }

        // 4. تحديث السجل بـ checkout_id المستلم لاستخدامه في التحقق لاحقاً
        $payment->update(['transaction_id' => $response['checkout_id']]);

        // 5. إرجاع البيانات (عادةً يتم توجيه المستخدم لصفحة تحتوي على الـ Payment Widget)
        // return response()->json([
        //     'status'      => 'success',
        //     'checkout_id' => $response['checkout_id'],
        //     'payment_url' => $response['payment_url'],
        // ]);

        if ($response['success']) {
            $payment->update(['transaction_id' => $response['checkout_id']]);

            return view('payment', [
                'payment_url' => $response['payment_url'],
                'payment_id'  => $payment->id,
                'amount'      => $payment->amount,
                'currency'    => $payment->currency
            ]);
        }
    }

    /**
     * الخطوة 2 و 3: معالجة العودة من البوابة (Result URL)
     * * يتم توجيه المستخدم هنا تلقائياً بعد إدخال بيانات البطاقة.
     */
    public function result(Request $request, HyperPayGateway $gateway)
    {
        $checkoutId = $request->get('id'); // يرسل تلقائياً من هايبر باي
        $paymentId  = $request->get('payment_id'); // مرسل من قبلنا في الـ result_url

        if (!$checkoutId || !$paymentId) {
            return response()->view('payment.error', ['message' => 'بيانات الدفع غير مكتملة']);
        }

        $payment = Payment::find($paymentId);
        if (!$payment) return 'Transaction not found ❌';

        // الاتصال بالسيرفر للتأكد من حالة العملية (Step 3 الرسمي)
        $verify = $gateway->verifyPayment($checkoutId);

        if ($verify['success']) {
            DB::transaction(function () use ($payment, $verify) {
                // نحدث الحالة فقط إذا لم تكن مكتملة (لتجنب تكرار العمليات)
                if ($payment->status !== 'completed') {
                    $payment->markAsCompleted(
                        data_get($verify['data'], 'id'), // رقم العملية في هايبر باي
                        $verify['data'] // كامل بيانات الرد للحفظ
                    );
                }
            });

            return redirect()->route('payment.success', ['payment_id' => $payment->id]);
        }

        Log::warning("[HyperPay] Payment Failed for ID: {$paymentId}", ['verify_response' => $verify]);
        return 'Payment Failed: ' . ($verify['message'] ?? 'Unknown Error');
    }

    /**
     * صفحة النجاح النهائية
     */
    public function success(Request $request)
    {
        $payment = Payment::find($request->get('payment_id'));

        if (!$payment) return 'Payment record missing ❌';

        return $payment->status === 'completed'
            ? 'Success: تم تأكيد الدفع بنجاح ✅'
            : 'Pending: العملية قيد المعالجة ⏳';
    }

    /**
     * الخطوة 4: التنبيهات الخلفية (Webhook)
     * * تضمن تحديث حالة الطلب حتى لو أغلق العميل المتصفح قبل العودة للموقع.
     */
    public function webhook(Request $request, HyperPayGateway $gateway)
    {
        $result = $gateway->handleWebhook($request);

        if ($result['success']) {
            // نبحث عن المعاملة باستخدام الـ checkout_id
            $payment = Payment::where('transaction_id', $result['checkout_id'])->first();

            if ($payment && $payment->status !== 'completed') {
                DB::transaction(function () use ($payment, $result) {
                    $payment->markAsCompleted(
                        data_get($result['data'], 'id'),
                        $result['data']
                    );
                });
                Log::info("[HyperPay Webhook] Order updated successfully: {$payment->id}");
            }
        }

        // هايبر باي تتوقع دائماً رد 200 لتتوقف عن إعادة المحاولة
        return response()->json(['status' => 'received']);
    }
}
