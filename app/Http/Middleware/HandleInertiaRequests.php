<?php

namespace App\Http\Middleware;

use App\Domain\Game\Services\CharacterSnapshot;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'gameCharacter' => fn () => $user
                ? app(CharacterSnapshot::class)->for($user)
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'reward' => fn () => $request->session()->get('reward'),
                'game_event' => fn () => $request->session()->get('game_event'),
            ],
        ];
    }
}
