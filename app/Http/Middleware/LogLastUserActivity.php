<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class LogLastUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // تحقق من جميع الـ guards المفعلة
        foreach (['web', 'admin'] as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                $lastActivity = Carbon::parse($user->last_activity);

                if (is_null($user->last_activity) ||
                    $lastActivity->diffInMinutes(now()) > 5) {
                    $user->update(['last_activity' => now()]);
                }
                break; // خروج من اللوب بعد إيجاد المستخدم
            }
        }

        return $next($request);
    }
}
