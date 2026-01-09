<?php

use App\Http\Middleware\LogLastUserActivity;
use App\Http\Middleware\CheckActiveDevice;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // ✅ 1) سجّل aliases لميدلويرات الترجمة
        $middleware->alias([
            'localize'              => \Mcamara\LaravelLocalization\Middleware\LaravelLocalizationRoutes::class,
            'localizationRedirect'  => \Mcamara\LaravelLocalization\Middleware\LaravelLocalizationRedirectFilter::class,
            'localeSessionRedirect' => \Mcamara\LaravelLocalization\Middleware\LocaleSessionRedirect::class,
            'localeCookieRedirect'  => \Mcamara\LaravelLocalization\Middleware\LocaleCookieRedirect::class,
            'localeViewPath'        => \Mcamara\LaravelLocalization\Middleware\LaravelLocalizationViewPath::class,
            'checkPlanAccess' => \App\Http\Middleware\CheckPlanAccess::class,
            'CheckActiveDevice' => \App\Http\Middleware\CheckActiveDevice::class,

        ]);

        // (اختياري) لو حابب تضيف ميدلوير عام للويب/الـ API خليه هون:
        $middleware->web([
            CheckActiveDevice::class,
            LogLastUserActivity::class,
            // Alkoumi\LaravelArabicNumbers\Http\Middleware\ConvertArabicDigitsToEnlishMiddleware::class
        ]);

        $middleware->api([
            CheckActiveDevice::class,
            LogLastUserActivity::class,
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();