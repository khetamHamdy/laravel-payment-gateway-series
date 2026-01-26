<?php

return [
    'payments' => [
        'default_gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'moyasar'),
        'test_mode' => env('PAYMENT_TEST_MODE', default: true),
        'secret_key' => env('MOYASAR_SECRET_KEY'),
        'api_key' => env('MOYASAR_API_KEY'),
        'api_url' => env('MOYASAR_API_URL'),
    ],

];
