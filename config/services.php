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

    'telr' => [
        'api_url'      => env('TELR_API_URL'),
        'store_id'     => env('TELR_STORE_ID'),
        'auth_key'     => env('TELR_AUTH_KEY'),
        'test_mode'    => env('TELR_TEST_MODE', true)
    ],

    'currencyfreaks' => [
        'key' => env('CURRENCYFREAKS_KEY'),
    ],


];
