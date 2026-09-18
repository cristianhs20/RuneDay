<?php

namespace App\Http\Controllers;

use App\Domain\Game\Models\Achievement;
use App\Domain\Game\Models\AchievementUnlock;
use App\Domain\Game\Services\AchievementEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function __invoke(Request $request, AchievementEngine $engine): Response
    {
        $user = $request->user();
        $unlocks = AchievementUnlock::query()
            ->where('user_id', $user->id)
            ->get()
            ->keyBy('achievement_id');

        $achievements = Achievement::query()
            ->orderBy('sort_order')
            ->get()
            ->map(function (Achievement $achievement) use ($user, $unlocks, $engine) {
                $unlock = $unlocks->get($achievement->id);
                $progress = min(
                    $achievement->threshold,
                    $engine->progress($user, $achievement->criteria_type),
                );

                return [
                    'slug' => $achievement->slug,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'threshold' => $achievement->threshold,
                    'progress' => $progress,
                    'reward_xp' => $achievement->reward_xp,
                    'reward_gold' => $achievement->reward_gold,
                    'unlocked' => $unlock !== null,
                    'unlocked_at' => $unlock?->unlocked_at->toISOString(),
                ];
            });

        return Inertia::render('game/achievements', [
            'achievements' => $achievements,
        ]);
    }
}
