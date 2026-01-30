<?php

namespace App\Services\Billing\Gateways;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Billing\Contracts\PaymentGatewayInterface;

/**
 * HyperPay Gateway Service
 * * هذه الفئة مسؤولة عن إدارة التكامل مع بوابة HyperPay بنمط Copy-and-Pay.
 * تتبع الخطوات الثلاث الرسمية: Prepare Checkout, Create Form, Get Status.
 * * @see https://hyperpay.docs.oppwa.com/tutorials/integration-guide
 */
class HyperPayGateway implements PaymentGatewayInterface
{
    protected string $apiUrl;
    protected string $entityId;
    protected string $accessToken;

    /**
     * تهيئة الإعدادات من ملف الـ config.
     */
    public function __construct()
    {
        $this->apiUrl      = rtrim(config('services.hyperpay.api_url'), '/');
        $this->entityId    = config('services.hyperpay.entity_id');
        $this->accessToken = config('services.hyperpay.access_token');
    }

    /**
     * اسم البوابة المستخدم في النظام.
     */
    public function getName(): string
    {
        return 'hyperpay';
    }

    /**
     * الخطوة الأولى: إنشاء جلسة دفع (Prepare Checkout)
     * * ترسل هذه الدالة البيانات للسيرفر وتستقبل Checkout ID.
     * @see https://hyperpay.docs.oppwa.com/tutorials/integration-guide/step-1-prepare-the-checkout
     */
    public function createCheckout(mixed $customer, mixed $product, mixed $transaction, array $options = []): array
    {
        try {
            $payload = $options['payload'] ?? [];

            // تحويل المبلغ لصيغة عشرية (مثلاً 92.00) كما يطلب التوثيق
            $amount = number_format($payload['amount'], 2, '.', '');

            $response = Http::withToken($this->accessToken)
                ->asForm()
                ->post($this->apiUrl . '/v1/checkouts', [
                    'entityId'              => $this->entityId,
                    'amount'                => $amount,
                    'currency'              => $payload['currency'] ?? 'SAR',
                    'paymentType'           => 'DB', // DB: Debit (دفع مباشر)
                    'merchantTransactionId' => (string) $transaction->id, // ربط العملية بنظامنا
                    'customer.email'        => $customer->email ?? 'guest@example.com',
                    'customer.givenName'    => $customer->first_name ?? 'Customer',
                    'customer.surname'      => $customer->last_name ?? 'Name',
                    'notificationUrl'       => $payload['result_url'] ?? route('payment.webhook', ['gateway' => 'hyperpay']),
                    'integrity'             => 'true', // لضمان سلامة البيانات كما يوصي التوثيق
                    // باراميترات مخصصة يمكن استرجاعها لاحقاً
                    'customParameters[transaction_id]' => $transaction->id,
                ]);

            if ($response->successful()) {
                $checkoutId = $response->json('id');
                return [
                    'success'        => true,
                    'checkout_id'    => $checkoutId,
                    'payment_url'    => $this->getPaymentWidgetUrl($checkoutId),
                    'transaction_id' => $transaction->id,
                    'raw'            => $response->json(),
                ];
            }

            Log::error('[HyperPay] Checkout Preparation Failed', $response->json());
            return $this->fail($response->json('result.description') ?? 'Gateway Error');

        } catch (\Throwable $e) {
            Log::error('[HyperPay] Exception in createCheckout: ' . $e->getMessage());
            return $this->fail('Internal Server Error during checkout preparation');
        }
    }

    /**
     * الخطوة الثالثة: التحقق من حالة الدفع (Get Payment Status)
     * * @see https://hyperpay.docs.oppwa.com/tutorials/integration-guide/step-3-get-payment-status
     */
    public function verifyPayment(string $checkoutId): array
    {
        try {
            $response = Http::withToken($this->accessToken)
                ->get($this->apiUrl . "/v1/checkouts/{$checkoutId}/payment", [
                    'entityId' => $this->entityId
                ]);

            if ($response->failed()) {
                Log::error('[HyperPay] Verification Failed', $response->json());
                return ['success' => false, 'data' => [], 'message' => 'Gateway verification failed'];
            }

            $data = $response->json();
            $resultCode = data_get($data, 'result.code', '');

            /**
             * أكواد النجاح المعتمدة في HyperPay:
             * 000.000.000 و 000.100.110 (نجاح)
             * 000.400.010 و 000.400.020 (نجاح مع مراجعة)
             */
            $isSuccess = preg_match('/^(000\.000\.|000\.100\.1|000\.[36])/', $resultCode);

            return [
                'success' => (bool) $isSuccess,
                'data'    => $data,
                'message' => data_get($data, 'result.description', '')
            ];
        } catch (\Throwable $e) {
            Log::error('[HyperPay] verifyPayment Exception: ' . $e->getMessage());
            return ['success' => false, 'data' => [], 'message' => 'Internal Server Error'];
        }
    }

    /**
     * الخطوة الثانية: جلب رابط الـ Widget الخاص بالـ Frontend.
     */
    protected function getPaymentWidgetUrl(string $checkoutId): string
    {
        return $this->apiUrl . "/v1/paymentWidgets.js?checkoutId={$checkoutId}";
    }

    /**
     * معالجة التنبيهات القادمة من السيرفر (Webhook)
     */
    public function handleWebhook(Request $request): array
    {
        $checkoutId = $request->input('id');

        if (!$checkoutId) {
            Log::warning('[HyperPay Webhook] Received empty notification');
            return ['success' => false, 'message' => 'No ID provided'];
        }

        // التحقق من الحالة مباشرة من سيرفر هايبر باي لضمان الأمان
        $verification = $this->verifyPayment($checkoutId);

        return [
            'success'        => $verification['success'],
            'checkout_id'    => $checkoutId,
            'transaction_id' => data_get($verification['data'], 'merchantTransactionId'),
            'data'           => $verification['data'],
            'message'        => $verification['message']
        ];
    }

    protected function fail(string $message): array
    {
        return ['success' => false, 'error' => $message];
    }
}