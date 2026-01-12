<?php

namespace App\Http\Controllers\Payment;

use App\Services\Billing\Gateways\PaylinkGateway;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

/**
 * Class PaymentTestController
 *
 * This controller is used ONLY for:
 * - Testing payment gateway integration
 * - Educational & learning purposes
 *
 * ❌ Not intended for production usage
 * ❌ No database operations here
 */
class PaymentTestController extends Controller
{
    /**
     * Create a test checkout session
     *
     * This method:
     * - Prepares the payload according to Paylink documentation
     * - Delegates the payment creation to the gateway class
     *
     * Controller responsibility:
     * - Prepare request data
     * - Call the gateway
     * - Return the response
     */
    public function checkout(PaylinkGateway $gateway)
    {
        /**
         * Payment payload
         *
         * In real projects, this data usually comes from:
         * - Request
         * - Order / Subscription model
         */
        $payload = [
            'orderNumber' => 'TEST_' . time(), // Unique test order number
            'amount' => 100,
            'currency' => 'SAR',
            'clientName' => 'Test User',
            'clientMobile' => '0500000000',
            'products' => [
                [
                    'title' => 'Test Product',
                    'price' => 100,
                    'qty' => 1,
                ],
            ],
            // Webhook URL that Paylink will call after payment status changes
            'callBackUrl' => route('payment.webhook', 'paylink'),

            // URL to redirect user if payment is cancelled
            'cancelUrl' => url('/cancel'),
        ];

        /**
         * Call the gateway and return its unified response
         */
        return response()->json(
            $gateway->createCheckout(
                customer: null,
                product: null,
                transaction: null,
                options: ['payload' => $payload]
            )
        );
    }

    /**
     * Handle Paylink webhook callback
     *
     * This endpoint receives payment status updates from Paylink.
     *
     * ⚠️ No business logic here:
     * - No database updates
     * - No order activation
     *
     * It only forwards the request to the gateway
     * which parses and normalizes the response.
     */
    public function webhook(Request $request, PaylinkGateway $gateway)
    {
        return response()->json(
            $gateway->handleWebhook($request)
        );
    }
}
