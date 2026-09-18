<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\EquippedItem;
use App\Models\User;

class CharacterSnapshot
{
    public function __construct(private readonly CharacterStats $stats) {}

    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $profile = CharacterProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['appearance' => CharacterProfile::defaultAppearance()],
        );

        $rawArchetype = $profile->getRawOriginal('archetype');

        if (! $profile->appearance || ! is_string($rawArchetype) || $rawArchetype === '') {
            $profile->forceFill([
                'appearance' => $profile->appearance ?: CharacterProfile::defaultAppearance(),
                'archetype' => is_string($rawArchetype) && $rawArchetype !== ''
                    ? $rawArchetype
                    : 'wanderer',
            ])->save();
            $profile->refresh();
        }

        $equipment = EquippedItem::query()
            ->where('user_id', $user->id)
            ->with('inventoryItem.item')
            ->get()
            ->mapWithKeys(function (EquippedItem $equipped) {
                $item = $equipped->inventoryItem->item;

                return [
                    $equipped->slot->value => [
                        'inventory_item_id' => $equipped->inventory_item_id,
                        'slug' => $item->slug,
                        'name' => $item->name,
                        'rarity' => $item->rarity->value,
                        'visual_key' => $item->visual_key,
                        'stats' => $item->stats ?? [],
                    ],
                ];
            })
            ->all();

        return [
            'created' => $profile->character_created_at !== null,
            'name' => $profile->character_name ?: $user->name,
            'archetype' => (string) ($profile->getRawOriginal('archetype') ?: 'wanderer'),
            'appearance' => $profile->appearance ?? CharacterProfile::defaultAppearance(),
            'level' => $profile->level,
            'xp' => $profile->xp,
            'total_xp' => $profile->total_xp,
            'gold' => $profile->gold,
            'equipment' => $equipment,
            'stats' => $this->stats->for($user),
        ];
    }
}
