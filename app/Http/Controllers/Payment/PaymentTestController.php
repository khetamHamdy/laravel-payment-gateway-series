<?php

namespace App\Http\Controllers\Payment;

use App\Services\Billing\Gateways\PaylinkGateway;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;

class PaymentTestController extends Controller
{
    /**
     * بدء عملية الدفع وإنشاء سجل "Pending"
     */
    public function checkout(PaylinkGateway $gateway)
    {
        // 1. إنشاء سجل الدفع في قاعدة البيانات
        // ملاحظة: الـ payment_reference سيتم توليده تلقائياً من الموديل (Boot method)
        $payment = Payment::create([
            'user_id' => Auth::id() ?? 1, // نفترض مستخدم رقم 1 للتجربة
            'amount'  => 100.00,
            'currency' => 'SAR',
            'gateway'  => 'paylink',
            'status'   => 'pending',
        ]);

        // 2. تجهيز البيانات لإرسالها لـ Paylink
        $payload = [
            'orderNumber' => $payment->payment_reference, // نستخدم المرجع الذي ولده الموديل
            'amount'      => $payment->amount,
            'currency'    => $payment->currency,
            'clientName'  => 'Test User',
            'clientMobile' => '0500000000',
            'products'    => [
                [
                    'title' => 'Test Product Unit',
                    'price' => $payment->amount,
                    'qty'   => 1,
                ],
            ],
            'callBackUrl' => route('payment.webhook'), // الويب هوك لمعالجة الحالة تلقائياً
            'cancelUrl'   => url('/cancel'),
        ];

        // 3. استدعاء البوابة والحصول على رابط الدفع
        $response = $gateway->createCheckout(
            customer: null,
            product: null,
            transaction: null,
            options: ['payload' => $payload]
        );

        /**
         * ملاحظة: الـ Gateway سيعيد لنا رابط الدفع (url)
         * والـ (transaction_id) الخاص بـ Paylink.
         */
        return response()->json($response);
    }

    /**
     * معالجة الـ Webhook (تحديث الحالة تلقائياً)
     */
    public function webhook(Request $request, PaylinkGateway $gateway)
    {
        // 1. استخدام الـ Service لتحليل البيانات القادمة من Paylink
        $result = $gateway->handleWebhook($request);

        // 2. البحث عن العملية في قاعدة البيانات باستخدام المرجع (Reference)
        $payment = Payment::where('payment_reference', $result['order_number'])->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        // 3. تحديث الحالة بناءً على النتيجة القادمة من البوابة
        if ($result['success']) {
            // استخدام الـ Method التي عرفناها في الموديل
            $payment->markAsCompleted(
                gatewayTransactionId: $result['transaction_id'],
                gatewayResponse: $result['raw_data']
            );
        } else {
            // في حال فشل الدفع
            $payment->markAsFailed(
                reason: $result['error_message'] ?? 'Payment Failed',
                gatewayResponse: $result['raw_data']
            );
        }

        // 4. الرد على Paylink بنجاح الاستلام
        return response()->json(['status' => 'webhook processed successfully']);
    }
}
