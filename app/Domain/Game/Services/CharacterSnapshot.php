<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\EquippedItem;
use App\Models\User;

class CharacterSnapshot
{
    public function __construct(
        private readonly CharacterStats $stats,
        private readonly CharacterSystem $system,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $profile = CharacterProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'lineage' => 'human',
                'appearance' => $this->system->defaults('human'),
                'character_system_version' => $this->system->systemVersion(),
            ],
        );

        $rawArchetype = $profile->getRawOriginal('archetype');
        $rawLineage = $profile->getRawOriginal('lineage');

        $lineage = $this->system
            ->normalizeLineage(
                is_string($rawLineage) ? $rawLineage : null,
            )
            ->value;

        $appearance = $this->system->normalizeAppearance(
            $lineage,
            $profile->appearance,
        );

        $needsNormalization = ! is_string($rawArchetype)
            || $rawArchetype === ''
            || ! is_string($rawLineage)
            || $rawLineage !== $lineage
            || $profile->appearance !== $appearance
            || $profile->character_system_version !== $this->system->systemVersion();

        if ($needsNormalization) {
            $profile->forceFill([
                'appearance' => $appearance,
                'archetype' => is_string($rawArchetype) && $rawArchetype !== ''
                    ? $rawArchetype
                    : 'wanderer',
                'lineage' => $lineage,
                'character_system_version' => $this->system->systemVersion(),
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
            'archetype' => (string) (
                $profile->getRawOriginal('archetype') ?: 'wanderer'
            ),
            'lineage' => $lineage,
            'character_system_version' => $this->system->systemVersion(),
            'appearance' => $appearance,
            'level' => $profile->level,
            'xp' => $profile->xp,
            'total_xp' => $profile->total_xp,
            'gold' => $profile->gold,
            'equipment' => $equipment,
            'stats' => $this->stats->for($user),
        ];
    }
}
