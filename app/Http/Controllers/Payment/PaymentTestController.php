<?php

namespace App\Http\Controllers\Payment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Billing\Gateways\MoyasarGateway;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class PaymentTestController extends Controller
{
    /**
     * المرحلة الأولى: إنشاء سجل الدفع وتوجيه العميل لبوابة ميسر
     */
    public function checkout(MoyasarGateway $gateway)
    {
        Log::info('[Checkout] بدء عملية دفع جديدة لليوزر: ' . (Auth::id() ?? 'Guest'));

        // 1. إنشاء سجل دفع بانتظار التنفيذ (Pending)
        $payment = Payment::create([
            'user_id'   => Auth::id() ?? 1,
            'amount'    => 100.00,
            'currency'  => 'SAR',
            'gateway'   => 'moyasar',
            'status'    => 'pending',
        ]);

        // 2. تجهيز البيانات المطلوبة لميسر
        $payload = [
            'amount'       => (int) ($payment->amount * 100), // تحويل للهللة
            'currency'     => $payment->currency,
            'description'  => 'Payment #' . $payment->id,
            'callback_url' => route('payment.webhook', ['gateway' => 'moyasar']),
            'success_url'  => route('payment.success', ['payment_id' => $payment->id]),
            'metadata'     => [
                'payment_id' => $payment->id, // لحفظ العلاقة في ميسر
            ],
        ];

        // 3. طلب رابط الدفع من الخدمة
        $response = $gateway->createCheckout(
            customer: Auth::user(),
            product: null,
            transaction: $payment, // نمرر السجل بدلاً من null
            options: ['payload' => $payload]
        );

        if ($response['success']) {
            $payment->update(['transaction_id' => $response['transaction_id']]);
            Log::info("[Checkout] تم توليد رابط الدفع بنجاح: " . $response['transaction_id']);

            return response()->json([
                'status'      => 'success',
                'payment_url' => $response['payment_url'],
            ]);
        }

        Log::error('[Checkout] فشل في إنشاء رابط الدفع: ' . ($response['error'] ?? 'Unknown error'));
        return response()->json($response, 400);
    }

    /**
     * المرحلة الثانية: استقبال إشعار ميسر (Webhook) وتحديث قاعدة البيانات
     * ملاحظة: يتم الاستدعاء من خادم ميسر مباشرة
     */
    public function webhook(Request $request)
    {
        $moyasarId = $request->input('id');
        Log::info("[Webhook] استقبال إشعار دفع من ميسر للمعرف: $moyasarId");

        // 1. التحقق من صحة المعاملة من سيرفر ميسر (أمان إضافي)
        $response = Http::withBasicAuth(config('services.moyasar.secret_key'), '')
            ->get("https://api.moyasar.com/v1/payments/{$moyasarId}");

        if ($response->failed()) {
            Log::error("[Webhook] فشل التحقق من الفاتورة $moyasarId من سيرفر ميسر.");
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $response->json();
        $paymentId = $data['metadata']['payment_id'] ?? null;

        // 2. تحديث السجل باستخدام Transaction لضمان سلامة البيانات
        DB::transaction(function () use ($paymentId, $data) {
            $payment = Payment::lockForUpdate()->find($paymentId);

            if ($payment && $data['status'] === 'paid' && $payment->status !== 'completed') {
                $payment->markAsCompleted($data['id'], $data);
                Log::info("[Webhook] تم تحديث حالة الطلب $paymentId إلى 'مكتمل'.");
            }
        });

        return response()->json(['status' => 'ok']);
    }

    /**
     * المرحلة الثالثة: صفحة العودة (Success Page)
     * ملاحظة: هنا نتأكد من حالة الدفع قبل إظهار رسالة النجاح للمستخدم
     */
  public function success(Request $request)
{
    $paymentId = $request->query('id'); // معرف ميسر
    $localPaymentId = $request->query('payment_id'); // معرفنا المحلي

    Log::info("[SuccessPage] User returned", ['moyasar_id' => $paymentId, 'local_id' => $localPaymentId]);

    $payment = Payment::find($localPaymentId);
    if (!$payment) return 'Payment not found ❌';

    // 1. التحقق من وجود المعرف لتجنب طلب API خاطئ
    if (!$paymentId) {
        Log::warning("[SuccessPage] No payment ID provided in URL");
        return 'Invalid response from gateway ❌';
    }

    // 2. التحقق من سيرفر ميسر
    $response = Http::withBasicAuth(config('services.moyasar.secret_key'), '')
                    ->get("https://api.moyasar.com/v1/payments/{$paymentId}");

    if ($response->successful()) {
        $data = $response->json();

        // 3. التأكد من وجود مفتاح status قبل المقارنة (أهم خطوة لمنع الـ Undefined array key)
        $status = $data['status'] ?? null;

        if ($status === 'paid') {
            if ($payment->status !== 'completed') {
                $payment->markAsCompleted($data['id'], $data);
            }
            return 'Payment Successful ✅';
        }

        if ($status === 'failed') {
            return 'Payment Failed: ' . ($data['source']['message'] ?? 'Unknown error') . ' ❌';
        }
    }

    Log::error("[SuccessPage] Moyasar verification failed", ['response' => $response->json()]);
    return 'Payment is pending or failed ⏳';
}
}
