<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Services (Phase 4)
    |--------------------------------------------------------------------------
    */

    'paylink' => [
        'api_url' => env('PAYLINK_API_URL'),
        'sandbox_url' => env('PAYLINK_SANDBOX_URL'),
        'api_key' => env('PAYLINK_API_KEY'),
        'secret_key' => env('PAYLINK_SECRET_KEY'),
    ],

    'moyasar' => [
        'secret_key' => env('MOYASAR_SECRET_KEY'),
        'api_key' => env('MOYASAR_API_KEY'),
        'api_url' => env('MOYASAR_API_URL'),
    ],

    'telr' => [
        'api_url'      => env('TELR_API_URL'),
        'store_id'     => env('TELR_STORE_ID'),
        'auth_key'     => env('TELR_AUTH_KEY'),
        'test_mode'    => env('TELR_TEST_MODE', true)
    ],

/*
    |--------------------------------------------------------------------------
    | HyperPay Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | هنا نقوم بضبط إعدادات بوابة هايبر باي.
    | التوثيق يتطلب رابط مختلف ومفاتيح مختلفة حسب وضع البيئة (Sandbox/Production).
    |
    */

    'hyperpay' => [
        // الرابط الافتراضي هو Sandbox لضمان الأمان أثناء التطوير
        'api_url'      => env('HYPERPAY_BASE_URL', 'https://eu-test.oppwa.com'),
        'entity_id'    => env('HYPERPAY_ENTITY_ID'),
        'access_token' => env('HYPERPAY_ACCESS_TOKEN'),

        /**
         * وضع الاختبار (testMode)
         * يفضل وضعه في ملف الـ .env ليتم إرساله في طلب الـ Checkout والـ Widget
         * القيم المتاحة: EXTERNAL (للتجربة) أو نتركه فارغاً للإنتاج
         */
        'test_mode'    => env('HYPERPAY_TEST_MODE', 'EXTERNAL'),
    ],
];
