<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\EquippedItem;
use App\Models\User;

class CharacterStats
{
    /**
     * @return array{power: int, guard: int, focus: int, luck: int, gear_score: int}
     */
    public function for(User $user): array
    {
        $profile = CharacterProfile::firstOrCreate(['user_id' => $user->id]);
        $stats = [
            'power' => 5 + ($profile->level * 2),
            'guard' => 5 + $profile->level,
            'focus' => 5 + intdiv($profile->level, 2),
            'luck' => 1 + intdiv($profile->level, 5),
            'gear_score' => 0,
        ];

        $equipment = EquippedItem::query()
            ->where('user_id', $user->id)
            ->with('inventoryItem.item')
            ->get();

        foreach ($equipment as $equipped) {
            $item = $equipped->inventoryItem->item;

            foreach ($item->stats ?? [] as $key => $value) {
                if (isset($stats[$key])) {
                    $stats[$key] += (int) $value;
                }
            }

            $stats['gear_score'] += $item->rarity->rank() * 10;
        }

        return $stats;
    }
}
