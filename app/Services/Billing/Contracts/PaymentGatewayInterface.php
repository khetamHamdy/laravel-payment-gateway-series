<?php

namespace App\Services\Payment\Contracts;

use Illuminate\Http\Request;

/**
 * Interface PaymentGatewayInterface
 *
 * Defines a contract for any payment gateway implementation.
 *
 * This allows creating multiple gateways (Stripe, Telr, Paylink, etc.)
 * while keeping a consistent interface for checkout and webhooks.
 */
interface PaymentGatewayInterface
{
    /**
     * Create a checkout session
     *
     * @param mixed $customer  // Can be any object representing the customer
     * @param mixed $product   // Can be any object representing the product/plan
     * @param mixed $transaction // Can be any object representing the transaction/subscription
     * @param array $options   // Additional options for the gateway
     * @return array
     *
     * Example: Returns ['success' => true, 'payment_url' => '...']
     */
    public function createCheckout(mixed $customer, mixed $product, mixed $transaction, array $options = []): array;

    /**
     * Handle webhook from payment gateway
     *
     * @param Request $request
     * @return array
     *
     * Example: Returns the parsed response from the gateway
     */
    public function handleWebhook(Request $request): array;

    /**
     * Get the name of the gateway
     *
     * @return string
     */
    public function getName(): string;
}
