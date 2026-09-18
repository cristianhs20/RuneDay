<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\Achievement;
use App\Domain\Game\Models\AchievementUnlock;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\EquippedItem;
use App\Domain\Game\Models\LootDrop;
use App\Domain\Productivity\Models\FocusSession;
use App\Domain\Productivity\Models\HabitLog;
use App\Domain\Productivity\Models\Task;
use App\Domain\Social\Services\SocialActivityPublisher;
use App\Models\User;

class AchievementEngine
{
    public function __construct(
        private readonly RewardEngine $rewards,
        private readonly SocialActivityPublisher $social,
    ) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function evaluate(User $user): array
    {
        $unlocked = [];
        $alreadyUnlocked = AchievementUnlock::query()
            ->where('user_id', $user->id)
            ->pluck('achievement_id')
            ->all();

        $achievements = Achievement::query()
            ->when($alreadyUnlocked !== [], fn ($query) => $query->whereNotIn('id', $alreadyUnlocked))
            ->orderBy('sort_order')
            ->get();

        foreach ($achievements as $achievement) {
            $progress = $this->progress($user, $achievement->criteria_type);

            if ($progress < $achievement->threshold) {
                continue;
            }

            $unlock = AchievementUnlock::firstOrCreate(
                ['user_id' => $user->id, 'achievement_id' => $achievement->id],
                ['unlocked_at' => now()],
            );

            if (! $unlock->wasRecentlyCreated) {
                continue;
            }

            $this->rewards->grant(
                $user->id,
                'achievement_unlock',
                $unlock->id,
                $achievement->reward_xp,
                $achievement->reward_gold,
                ['achievement' => $achievement->slug],
            );

            $this->social->publish(
                $user,
                'achievement_unlocked',
                'achievement_unlock',
                $unlock->id,
                [
                    'slug' => $achievement->slug,
                    'name' => $achievement->name,
                    'icon' => $achievement->icon,
                ],
            );

            $unlocked[] = [
                'slug' => $achievement->slug,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'xp' => $achievement->reward_xp,
                'gold' => $achievement->reward_gold,
            ];
        }

        if ($unlocked !== []) {
            return array_merge($unlocked, $this->evaluate($user));
        }

        return [];
    }

    public function progress(User $user, string $criteriaType): int
    {
        return match ($criteriaType) {
            'quests_completed' => Task::query()
                ->where('user_id', $user->id)
                ->whereNotNull('completed_at')
                ->count(),
            'level' => CharacterProfile::firstOrCreate(['user_id' => $user->id])->level,
            'loot_found' => LootDrop::query()
                ->where('user_id', $user->id)
                ->where('dropped', true)
                ->count(),
            'items_equipped' => EquippedItem::query()
                ->where('user_id', $user->id)
                ->count(),
            'focus_minutes' => (int) FocusSession::query()
                ->where('user_id', $user->id)
                ->sum('duration_minutes'),
            'habit_logs' => HabitLog::query()
                ->where('user_id', $user->id)
                ->count(),
            default => 0,
        };
    }
}
