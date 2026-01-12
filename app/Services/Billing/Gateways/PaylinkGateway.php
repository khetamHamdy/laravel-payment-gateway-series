<?php

namespace App\Services\Billing\Gateways;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Billing\Contracts\PaymentGatewayInterface;

/**
 * Class PaylinkGateway
 *
 * Concrete implementation of PaymentGatewayInterface for Paylink.
 *
 * Responsibility:
 * - Communicate directly with Paylink API
 * - Handle authentication
 * - Create payment invoice
 * - Parse webhook responses
 *
 *  This class should NOT:
 * - Contain business logic (subscriptions, DB updates, etc.)
 * - Be aware of Controllers or Views
 */
class PaylinkGateway implements PaymentGatewayInterface
{
    /**
     * Paylink base API URL (sandbox or production)
     */
    protected string $apiUrl;

    /**
     * API credentials loaded from config/services.php
     */
    protected ?string $apiKey;
    protected ?string $secretKey;

    /**
     * Initialize gateway configuration
     *
     * Environment (sandbox / live) is controlled via config,
     * not hardcoded in the class.
     */
    public function __construct()
    {
        $testMode = config('services.paylink.test_mode', true);
        $this->apiUrl = $testMode
            ? config('services.paylink.sandbox_url')
            : config('services.paylink.api_url');
        $this->apiKey = config('services.paylink.api_key');
        $this->secretKey = config('services.paylink.secret_key');
    }

    /**
     * Get gateway unique identifier
     *
     * Used mainly by managers or logs
     */
    public function getName(): string
    {
        return 'paylink';
    }

    /**
     * Create checkout session
     *
     * ⚠️ Important:
     * This method expects the payload to be prepared outside
     * (Controller / Service layer).
     *
     * This keeps the gateway:
     * - Generic
     * - Reusable
     * - Decoupled from business logic
     *
     * @param mixed $customer     Any customer representation (optional)
     * @param mixed $product      Any product/plan representation (optional)
     * @param mixed $transaction  Any transaction/subscription model (optional)
     * @param array $options      Extra options (payload, metadata, etc.)
     *
     * @return array Standardized response
     */
    public function createCheckout(
        mixed $customer,
        mixed $product,
        mixed $transaction,
        array $options = []
    ): array {
        try {
            /**
             * Payload must follow Paylink API documentation.
             * If missing, gateway cannot proceed.
             */
            $payload = $options['payload'] ?? null;

            if (empty($payload)) {
                return $this->fail('Payload is required');
            }

            /**
             * Step 1️⃣ Authenticate with Paylink API
             */
            $auth = Http::post($this->apiUrl . '/api/auth', [
                'apiId' => $this->apiKey,
                'secretKey' => $this->secretKey,
                'persistToken' => false,
            ]);

            if (!$auth->successful()) {
                return $this->fail('Authentication failed');
            }

            $token = $auth->json('id_token');

            if (!$token) {
                return $this->fail('Token not returned');
            }

            /**
             * Step 2️⃣ Create invoice using authenticated token
             */
            $response = Http::withToken($token)
                ->post($this->apiUrl . '/api/addInvoice', $payload);

            if (!$response->successful()) {
                return $this->fail('Invoice creation failed');
            }

            $data = $response->json();

            /**
             * Return a unified response structure
             * regardless of the gateway implementation
             */
            return [
                'success' => true,
                'gateway' => 'paylink',
                'payment_url' =>
                data_get($data, 'url')
                    ?? data_get($data, 'mobileUrl')
                    ?? data_get($data, 'qrUrl'),
                'transaction_id' => data_get($data, 'transactionNo'),
                'raw' => $data, // Full raw response for logging/debugging
            ];
        } catch (\Throwable $e) {
            /**
             * Any unexpected error is logged for debugging
             * but not exposed directly to the end user.
             */
            Log::error('Paylink gateway error', [
                'message' => $e->getMessage(),
            ]);

            return $this->fail($e->getMessage());
        }
    }

    /**
     * Handle Paylink webhook callback
     *
     * This method only parses and normalizes the data.
     * It does NOT update database or activate subscriptions.
     */
    public function handleWebhook(Request $request): array
    {
        $data = $request->all();

        return [
            'success' => in_array(
                strtolower($data['orderStatus'] ?? ''),
                ['paid', 'success', 'completed']
            ),
            'reference' => $data['orderNumber'] ?? null,
            'transaction_id' => $data['transactionNo'] ?? null,
            'status' => $data['orderStatus'] ?? null,
            'gateway' => 'paylink',
            'raw' => $data,
        ];
    }

    /**
     * Standardized failure response
     *
     * Keeps error format consistent across all gateways
     */
    protected function fail(string $message): array
    {
        return [
            'success' => false,
            'gateway' => 'paylink',
            'error' => $message,
        ];
    }
}
