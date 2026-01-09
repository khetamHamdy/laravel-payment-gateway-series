<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\Admin;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\LogoutResponse;
use Laravel\Fortify\Fortify;


class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $request = request();
        $locale = app()->getLocale();

        if ($request->is('*/dashboard/*') || $request->is('dashboard/*')) {
            Config::set('fortify.guard', 'admin');
            Config::set('fortify.passwords', 'admins');
            Config::set('fortify.prefix', $locale . '/dashboard');
            Config::set('fortify.home', '/' . $locale . '/dashboard/home');
        } else {
            Config::set('fortify.guard', 'web');
            Config::set('fortify.passwords', 'users');
            Config::set('fortify.prefix', $locale);
            Config::set('fortify.home', '/' . $locale . '/');
        }

        $this->app->instance(LoginResponse::class, new class implements LoginResponse {
            public function toResponse($request)
            {
                if (Config::get('fortify.guard') == 'admin') {
                    return redirect()->intended('/' . app()->getLocale() . '/dashboard/home');
                }
                return redirect()->intended('/' . app()->getLocale());
            }
        });

        $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
            public function toResponse($request)
            {
                $locale = app()->getLocale();
                // تحقق من المسار الحالي قبل تسجيل الخروج
                $isDashboard = $request->is('*/dashboard/*') || str_contains($request->url(), '/dashboard/');
                if ($isDashboard) {
                    return redirect("/{$locale}/dashboard/login");
                }
                return redirect("/{$locale}/login");
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::loginView(function () {
            if (Config::get('fortify.guard') == 'admin') {
                return view('auth.admin.login');
            }
            return view('auth.user.login');
        });

        Fortify::authenticateUsing(function (Request $request) {
            if (Config::get('fortify.guard') == 'admin') {
                $user = Admin::where('username', $request->username)
                    ->orWhere('email', $request->username)
                    ->first();
                if ($user && Hash::check($request->password, $user->password)) {
                    ActivityLogService::log(
                        'Login',
                        'Admin',
                        "تم تسجيل دخول",
                        null,
                        null,
                        $user->id,
                        $user->name
                    );
                    return $user;
                }
            }
            $user = User::where('email', $request->username)->first();
            if ($user && Hash::check($request->password, $user->password)) {
                return $user;
            }
        });


        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());
            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
