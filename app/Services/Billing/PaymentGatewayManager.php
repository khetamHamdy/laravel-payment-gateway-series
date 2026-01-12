<?php

namespace App\Services\Billing;

use App\Services\Billing\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Request;

class PaymentGatewayManager
{
    protected PaymentGatewayInterface $gateway;
    protected $testMode;

    public function __construct(?string $gatewayName = null)
    {
        $this->testMode = config('settings.payments.test_mode', false);

        $gatewayName ??= config('settings.payments.default_gateway');

        $this->gateway = $this->resolveGateway($gatewayName);
    }

    /**
     * Resolve the payment gateway instance.
     */
    protected function resolveGateway(string $gatewayName): PaymentGatewayInterface
    {
        return match ($gatewayName) {
           // 'telr' => app(\App\Services\Payment\Gateways\TelrGateway::class),

            default => throw new \InvalidArgumentException(
                "Unsupported payment gateway [{$gatewayName}]"
            ),
        };
    }

    /**
     * Create a checkout session using the active gateway.
     */
    public function createCheckout(
        mixed $customer,
        mixed $product,
        mixed $transaction,
        array $options = []
    ): array {
        return $this->gateway->createCheckout(
            $customer,
            $product,
            $transaction,
            $options
        );
    }

    /**
     * Handle webhook request.
     */
    public function handleWebhook(Request $request, ?string $gatewayName = null): array
    {
        if ($gatewayName) {
            return $this->resolveGateway($gatewayName)
                ->handleWebhook($request);
        }

        return $this->gateway->handleWebhook($request);
    }

    /**
     * Get current gateway name
     */
    public function getGatewayName(): string
    {
        return $this->gateway->getName();
    }

    /**
     * Check if in test mode
     */
    public function isTestMode(): bool
    {
        return $this->testMode;
    }
}
