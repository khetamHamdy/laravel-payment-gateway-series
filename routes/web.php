<?php

use App\Http\Controllers\API\V1\BillingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Payment\PaymentTestController;

Route::prefix('test/payment')->group(function () {
    Route::get('/checkout', [PaymentTestController::class, 'checkout']);
    Route::post('/webhook/{gateway}', [PaymentTestController::class, 'webhook'])
        ->name('payment.webhook');
});
