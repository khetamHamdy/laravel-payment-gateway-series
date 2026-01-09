<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPlanAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $type  (movie / series / category)
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $type)
    {
        $user = Auth('sanctum')->user();

        if (!$user || !$user->activeSubscription) {
            return response()->json(['message' => 'You need an active subscription'], 403);
        }

        $subscription = $user->activeSubscription;

        $contentId = $request->route('id')
            ?? $request->route('series')
            ?? $request->route('episode')
            ?? $request->route('categories')
            ?? null;

        $canAccess = match ($type) {
            'movie' => $subscription->canAccessMovie($contentId),
            'series' => $subscription->canAccessSeries($contentId),
            'category' => $subscription->canAccessCategory($contentId),
            default => false,
        };

        if (!$canAccess) {
            return response()->json([
                'message' => "Your plan does not allow access to this {$type}"
            ], 403);
        }

        return $next($request);
    }
}
