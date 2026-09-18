<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Models\AdventureObjective;
use App\Domain\Adventure\Models\ObjectiveClaim;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Models\RegionProgress;
use App\Domain\Game\Services\RewardEngine;
use App\Models\User;

class ObjectiveEngine
{
    public function __construct(
        private readonly RewardEngine $gameRewards,
        private readonly AdventureRewardService $adventureRewards,
    ) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function evaluate(User $user, Region $region): array
    {
        $claimedIds = ObjectiveClaim::query()
            ->where('user_id', $user->id)
            ->pluck('objective_id')
            ->all();

        $objectives = AdventureObjective::query()
            ->where('region_id', $region->id)
            ->when($claimedIds !== [], fn ($query) => $query->whereNotIn('id', $claimedIds))
            ->orderBy('sort_order')
            ->get();

        $unlocked = [];

        foreach ($objectives as $objective) {
            $progress = $this->progress($user, $region, $objective->criteria_type);

            if ($progress < $objective->threshold) {
                continue;
            }

            $claim = ObjectiveClaim::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'objective_id' => $objective->id,
                ],
                ['claimed_at' => now()],
            );

            if (! $claim->wasRecentlyCreated) {
                continue;
            }

            $this->gameRewards->grant(
                $user->id,
                'adventure_objective',
                $claim->id,
                0,
                $objective->reward_gold,
                ['objective' => $objective->slug],
            );

            $this->adventureRewards->grant(
                $user->id,
                'adventure_objective',
                $claim->id,
                $objective->reward_renown,
                ['objective' => $objective->slug],
            );

            $unlocked[] = [
                'slug' => $objective->slug,
                'name' => $objective->name,
                'description' => $objective->description,
                'gold' => $objective->reward_gold,
                'renown' => $objective->reward_renown,
            ];
        }

        return $unlocked;
    }

    public function progress(User $user, Region $region, string $criteriaType): int
    {
        $progress = RegionProgress::firstOrCreate([
            'user_id' => $user->id,
            'region_id' => $region->id,
        ]);

        return match ($criteriaType) {
            'region_victories' => (int) $progress->enemy_victories,
            'boss_victory' => $progress->boss_defeated_at ? 1 : 0,
            default => 0,
        };
    }
}
