<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Domain\Adventure\Enums\EnemyType;
use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Models\RegionProgress;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Models\ItemDefinition;
use App\Domain\Game\Services\InventoryGrantService;
use App\Domain\Game\Services\RewardEngine;
use App\Domain\Social\Services\SocialActivityPublisher;
use Illuminate\Support\Facades\DB;

class VictoryService
{
    public function __construct(
        private readonly RewardEngine $gameRewards,
        private readonly AdventureRewardService $adventureRewards,
        private readonly ObjectiveEngine $objectives,
        private readonly InventoryGrantService $inventory,
        private readonly WorldAccessService $access,
        private readonly SocialActivityPublisher $social,
    ) {}

    /**
     * @return array{
     *     gold: int,
     *     renown: int,
     *     boss_item: array<string, mixed>|null,
     *     objectives: array<int, array<string, mixed>>,
     *     unlocked_region: array<string, mixed>|null
     * }
     */
    public function settle(Encounter $encounter): array
    {
        return DB::transaction(function () use ($encounter) {
            $encounter = Encounter::query()
                ->with(['enemy', 'region', 'user'])
                ->lockForUpdate()
                ->findOrFail($encounter->id);

            if ($encounter->settled_at) {
                return [
                    'gold' => 0,
                    'renown' => 0,
                    'boss_item' => null,
                    'objectives' => [],
                    'unlocked_region' => null,
                ];
            }

            $enemy = $encounter->enemy;
            $region = $encounter->region;
            $user = $encounter->user;

            AdventureProfile::firstOrCreate(['user_id' => $user->id]);
            $profile = AdventureProfile::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $progress = RegionProgress::firstOrCreate([
                'user_id' => $user->id,
                'region_id' => $region->id,
            ]);
            $progress = RegionProgress::query()
                ->whereKey($progress->id)
                ->lockForUpdate()
                ->firstOrFail();

            $isBoss = $enemy->type === EnemyType::Boss;
            $firstBossClear = $isBoss && $progress->boss_defeated_at === null;

            $profile->forceFill([
                'victories' => $profile->victories + 1,
                'boss_victories' => $profile->boss_victories + ($isBoss ? 1 : 0),
            ])->save();

            if ($isBoss) {
                if ($firstBossClear) {
                    $progress->forceFill(['boss_defeated_at' => now()])->save();
                }
            } else {
                $progress->forceFill([
                    'enemy_victories' => $progress->enemy_victories + 1,
                ])->save();
            }

            $this->gameRewards->grant(
                $user->id,
                'adventure_victory',
                $encounter->id,
                0,
                $enemy->reward_gold,
                [
                    'enemy' => $enemy->slug,
                    'region' => $region->slug,
                    'boss' => $isBoss,
                ],
            );

            $this->adventureRewards->grant(
                $user->id,
                'adventure_victory',
                $encounter->id,
                $enemy->reward_renown,
                [
                    'enemy' => $enemy->slug,
                    'region' => $region->slug,
                    'boss' => $isBoss,
                ],
            );

            $bossItem = $firstBossClear
                ? $this->grantBossItem($encounter)
                : null;

            $objectiveUnlocks = $this->objectives->evaluate($user, $region);

            $encounter->forceFill([
                'status' => EncounterStatus::Victory->value,
                'completed_at' => $encounter->completed_at ?? now(),
                'settled_at' => now(),
            ])->save();

            $nextRegion = Region::query()
                ->where('sort_order', '>', $region->sort_order)
                ->orderBy('sort_order')
                ->first();

            $unlockedRegion = $nextRegion && $this->access->regionUnlocked($user, $nextRegion)
                ? [
                    'slug' => $nextRegion->slug,
                    'name' => $nextRegion->name,
                    'min_level' => $nextRegion->min_level,
                ]
                : null;

            if ($firstBossClear) {
                $this->social->publish(
                    $user,
                    'boss_victory',
                    'boss_victory',
                    $encounter->id,
                    [
                        'enemy' => $enemy->name,
                        'enemy_slug' => $enemy->slug,
                        'region' => $region->name,
                    ],
                );
            }

            if ($unlockedRegion) {
                $this->social->publish(
                    $user,
                    'region_unlocked',
                    'region_unlock',
                    $nextRegion->id,
                    [
                        'region' => $nextRegion->name,
                        'region_slug' => $nextRegion->slug,
                    ],
                );
            }

            return [
                'gold' => $enemy->reward_gold,
                'renown' => $enemy->reward_renown,
                'boss_item' => $bossItem,
                'objectives' => $objectiveUnlocks,
                'unlocked_region' => $unlockedRegion,
            ];
        });
    }

    /**
     * @return array<string, mixed>|null
     */
    private function grantBossItem(Encounter $encounter): ?array
    {
        $enemy = $encounter->enemy;
        $rarity = $enemy->boss_reward_rarity;

        if (! $rarity) {
            return null;
        }

        $level = CharacterProfile::firstOrCreate([
            'user_id' => $encounter->user_id,
        ])->level;

        $owned = InventoryItem::query()
            ->where('user_id', $encounter->user_id)
            ->pluck('item_definition_id')
            ->all();

        $candidates = ItemDefinition::query()
            ->where('drop_enabled', true)
            ->where('rarity', $rarity->value)
            ->where('min_level', '<=', $level)
            ->when($owned !== [], fn ($query) => $query->whereNotIn('id', $owned))
            ->orderBy('id')
            ->get();

        if ($candidates->isEmpty()) {
            return null;
        }

        $hash = hash(
            'sha256',
            $encounter->user_id.':'.$enemy->slug.':boss-first-clear',
        );
        $index = ((int) hexdec(substr($hash, 0, 8))) % $candidates->count();
        $item = $candidates->get($index);

        if (! $item) {
            return null;
        }

        $inventory = $this->inventory->grant(
            $encounter->user_id,
            $item,
            'boss',
            'boss_first_clear',
            $encounter->id,
        );

        return [
            'inventory_item_id' => $inventory->id,
            'slug' => $item->slug,
            'name' => $item->name,
            'rarity' => $item->rarity->value,
            'slot' => $item->slot?->value,
            'visual_key' => $item->visual_key,
            'stats' => $item->stats ?? [],
        ];
    }
}
