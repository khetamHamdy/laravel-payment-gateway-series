<?php

return [
    'app_name' =>  "Payment Gateways Demo",

    'payments' => [
        'default_gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'paylink'),
        'test_mode' => env('PAYMENT_TEST_MODE', true),
    ],
];
