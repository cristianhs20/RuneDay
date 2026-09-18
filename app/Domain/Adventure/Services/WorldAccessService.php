<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Enums\EnemyType;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Models\RegionProgress;
use App\Domain\Game\Models\CharacterProfile;
use App\Models\User;

class WorldAccessService
{
    public function regionUnlocked(User $user, Region $region): bool
    {
        $level = CharacterProfile::firstOrCreate(['user_id' => $user->id])->level;

        if ($level < $region->min_level) {
            return false;
        }

        $previous = Region::query()
            ->where('sort_order', '<', $region->sort_order)
            ->orderByDesc('sort_order')
            ->first();

        if (! $previous) {
            return true;
        }

        return RegionProgress::query()
            ->where('user_id', $user->id)
            ->where('region_id', $previous->id)
            ->whereNotNull('boss_defeated_at')
            ->exists();
    }

    public function bossUnlocked(User $user, Region $region): bool
    {
        if (! $this->regionUnlocked($user, $region)) {
            return false;
        }

        $victories = RegionProgress::query()
            ->where('user_id', $user->id)
            ->where('region_id', $region->id)
            ->value('enemy_victories') ?? 0;

        return (int) $victories >= $region->boss_unlock_victories;
    }

    public function enemyUnlocked(User $user, Enemy $enemy): bool
    {
        $region = $enemy->relationLoaded('region')
            ? $enemy->region
            : $enemy->region()->firstOrFail();

        if (! $this->regionUnlocked($user, $region)) {
            return false;
        }

        if ($enemy->type === EnemyType::Boss) {
            return $this->bossUnlocked($user, $region);
        }

        return true;
    }
}
