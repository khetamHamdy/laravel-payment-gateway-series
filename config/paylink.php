<?php

return [
    'payments' => [
        'default_gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'paylink'),
        'test_mode' => env('PAYMENT_TEST_MODE', true),
        'secret_key' => env('PAYLINK_SECRET_KEY'),
        'api_key' => env('PAYLINK_API_KEY'),
        'api_url' => env('PAYLINK_API_URL'),
        'sandbox_url' => env('PAYLINK_SANDBOX_URL'),
    ],

];
