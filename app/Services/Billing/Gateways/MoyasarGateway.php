<?php

namespace App\Services\Billing\Gateways;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Billing\Contracts\PaymentGatewayInterface;

/**
 * Class MoyasarGateway
 * إدارة عمليات الدفع عبر بوابة Moyasar (ميسر)
 */
class MoyasarGateway implements PaymentGatewayInterface
{
    protected string $apiUrl;
    protected ?string $secretKey;

    public function __construct()
    {
        // سحب الإعدادات من ملف config/services.php
        $this->apiUrl    = config('services.moyasar.api_url', 'https://api.moyasar.com/v1');
        $this->secretKey = config('services.moyasar.secret_key');
    }

    public function getName(): string
    {
        return 'moyasar';
    }

    /**
     * إنشاء فاتورة دفع جديدة (Create Invoice)
     * * @param mixed $customer بيانات العميل
     * @param mixed $product بيانات المنتج
     * @param mixed $transaction سجل المعاملة في قاعدة البيانات
     * @param array $options خيارات إضافية (المبلغ، العملة، الروابط)
     * @return array
     */
    public function createCheckout(mixed $customer, mixed $product, mixed $transaction, array $options = []): array
    {
        Log::info('[Moyasar] بدء عملية إنشاء رابط دفع للتفتيش رقم: ' . ($transaction->id ?? 'N/A'));

        try {
            $payload = $options['payload'] ?? [];

            // 1. التحقق من البيانات المرسلة
            if (empty($payload['amount'])) {
                Log::warning('[Moyasar] فشل الإنشاء: المبلغ غير محدد.');
                return $this->fail('Amount is required');
            }

            // 2. إرسال الطلب إلى API ميسر
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post($this->apiUrl . '/invoices', [
                    'amount'       => (int) $payload['amount'],
                    'currency'     => $payload['currency'] ?? 'SAR',
                    'description'  => $payload['description'] ?? 'Payment',
                    'callback_url' => $payload['callback_url'],
                    'success_url'  => $payload['success_url'] ?? null,
                    'metadata'     => array_merge($payload['metadata'] ?? [], [
                        'local_transaction_id' => $transaction->id ?? null
                    ]),
                ]);

            // 3. معالجة فشل الاستجابة من السيرفر
            if ($response->failed()) {
                Log::error('[Moyasar] خطأ من بوابة الدفع:', [
                    'status' => $response->status(),
                    'body'   => $response->json()
                ]);
                return $this->fail('Moyasar API Error: ' . $response->reason());
            }

            Log::info('[Moyasar] تم إنشاء الفاتورة بنجاح. معرف الفاتورة: ' . $response->json('id'));

            return [
                'success'        => true,
                'gateway'        => 'moyasar',
                'payment_url'    => $response->json('url'),
                'transaction_id' => $response->json('id'),
                'raw'            => $response->json(),
            ];

        } catch (\Throwable $e) {
            // 4. تسجيل أي خطأ تقني مفاجئ
            Log::critical('[Moyasar] استثناء غير متوقع (Exception): ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return $this->fail('Internal Server Error');
        }
    }

    /**
     * معالجة إشعارات الدفع التلقائية (Webhooks)
     * يتم استدعاؤها من قبل ميسر لتحديث حالة الطلب
     */
    public function handleWebhook(Request $request): array
    {
        $data = $request->all();

        Log::info('[Moyasar Webhook] تم استقبال إشعار جديد', ['data' => $data]);

        // استخراج الحالة والمعرف
        $status = $data['status'] ?? ($data['data']['status'] ?? null);
        $invoiceId = $data['id'] ?? ($data['data']['id'] ?? 'unknown');

        if ($status === 'paid') {
            Log::info("[Moyasar Webhook] عملية دفع ناجحة للفاتورة: $invoiceId");
        } else {
            Log::warning("[Moyasar Webhook] حالة الدفع ليست 'paid'. الحالة الحالية: $status");
        }

        return [
            'success'        => $status === 'paid',
            'payment_id'     => $data['metadata']['local_transaction_id'] ?? null,
            'transaction_id' => $invoiceId,
            'status'         => $status,
            'gateway'        => 'moyasar',
            'raw_data'       => $data,
        ];
    }

    /**
     * تنسيق مصفوفة الفشل وتوثيقها في السجلات
     */
    protected function fail(string $message): array
    {
        return [
            'success' => false,
            'gateway' => 'moyasar',
            'error'   => $message,
        ];
    }
}
