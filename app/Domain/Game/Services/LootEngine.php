<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Enums\ItemRarity;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Models\ItemDefinition;
use App\Domain\Game\Models\LootDrop;
use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Domain\Productivity\Models\Task;
use Illuminate\Support\Facades\DB;

class LootEngine
{
    public function __construct(private readonly InventoryGrantService $inventory) {}

    /**
     * @return array{drop: LootDrop, inventory_item: InventoryItem|null}
     */
    public function rollForTask(Task $task, float $rewardFactor = 1.0): array
    {
        return DB::transaction(function () use ($task, $rewardFactor) {
            $existing = LootDrop::query()
                ->where('user_id', $task->user_id)
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->with(['inventoryItem.item', 'item'])
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return [
                    'drop' => $existing,
                    'inventory_item' => $existing->inventoryItem,
                ];
            }

            $chanceRoll = $this->roll($task, 'drop', 10000);
            $isFirstRoll = ! LootDrop::query()
                ->where('user_id', $task->user_id)
                ->exists();

            $baseChance = match ($task->difficulty) {
                TaskDifficulty::Easy => 1500,
                TaskDifficulty::Normal => 2200,
                TaskDifficulty::Hard => 3500,
                TaskDifficulty::Epic => 5500,
            };
            $chance = $isFirstRoll
                ? 10000
                : (int) floor($baseChance * max(0.0, min(1.0, $rewardFactor)));

            if ($chanceRoll >= $chance) {
                return [
                    'drop' => LootDrop::create([
                        'user_id' => $task->user_id,
                        'source_type' => 'task_completion',
                        'source_id' => $task->id,
                        'roll' => $chanceRoll,
                        'dropped' => false,
                        'metadata' => [
                            'difficulty' => $task->difficulty->value,
                            'chance' => $chance,
                            'reward_factor' => $rewardFactor,
                            'first_roll_guarantee' => $isFirstRoll,
                        ],
                    ]),
                    'inventory_item' => null,
                ];
            }

            $rarityRoll = $this->roll($task, 'rarity', 10000);
            $rarity = $isFirstRoll
                ? ItemRarity::Common
                : $this->rarityFor($task->difficulty, $rarityRoll);
            $profile = CharacterProfile::firstOrCreate(['user_id' => $task->user_id]);

            $ownedIds = InventoryItem::query()
                ->where('user_id', $task->user_id)
                ->pluck('item_definition_id');

            $item = $this->findCandidate($profile->level, $rarity, $ownedIds->all(), $task);

            if (! $item) {
                return [
                    'drop' => LootDrop::create([
                        'user_id' => $task->user_id,
                        'source_type' => 'task_completion',
                        'source_id' => $task->id,
                        'rarity' => $rarity->value,
                        'roll' => $chanceRoll,
                        'dropped' => false,
                        'metadata' => [
                            'difficulty' => $task->difficulty->value,
                            'reason' => 'catalog_exhausted',
                        ],
                    ]),
                    'inventory_item' => null,
                ];
            }

            $inventoryItem = $this->inventory->grant(
                $task->user_id,
                $item,
                'loot',
                'task_completion',
                $task->id,
            );

            $drop = LootDrop::create([
                'user_id' => $task->user_id,
                'source_type' => 'task_completion',
                'source_id' => $task->id,
                'item_definition_id' => $item->id,
                'inventory_item_id' => $inventoryItem->id,
                'rarity' => $item->rarity->value,
                'roll' => $chanceRoll,
                'dropped' => true,
                'metadata' => [
                    'difficulty' => $task->difficulty->value,
                    'rarity_roll' => $rarityRoll,
                    'reward_factor' => $rewardFactor,
                    'first_roll_guarantee' => $isFirstRoll,
                ],
            ]);

            return ['drop' => $drop, 'inventory_item' => $inventoryItem->load('item')];
        });
    }

    /**
     * @param  array<int, int>  $ownedIds
     */
    private function findCandidate(
        int $level,
        ItemRarity $preferred,
        array $ownedIds,
        Task $task,
    ): ?ItemDefinition {
        $rarities = collect(ItemRarity::cases())
            ->sortBy(fn (ItemRarity $rarity) => abs($rarity->rank() - $preferred->rank()));

        foreach ($rarities as $rarity) {
            $candidates = ItemDefinition::query()
                ->where('drop_enabled', true)
                ->where('rarity', $rarity->value)
                ->where('min_level', '<=', $level)
                ->when($ownedIds !== [], fn ($query) => $query->whereNotIn('id', $ownedIds))
                ->orderBy('id')
                ->get();

            if ($candidates->isNotEmpty()) {
                $index = $this->roll($task, 'item-'.$rarity->value, $candidates->count());

                return $candidates->get($index);
            }
        }

        return null;
    }

    private function rarityFor(TaskDifficulty $difficulty, int $roll): ItemRarity
    {
        $thresholds = match ($difficulty) {
            TaskDifficulty::Easy => [7000, 9500, 9950],
            TaskDifficulty::Normal => [6000, 8800, 9800],
            TaskDifficulty::Hard => [4500, 8000, 9600],
            TaskDifficulty::Epic => [3000, 6800, 9200],
        };

        return match (true) {
            $roll < $thresholds[0] => ItemRarity::Common,
            $roll < $thresholds[1] => ItemRarity::Uncommon,
            $roll < $thresholds[2] => ItemRarity::Rare,
            default => ItemRarity::Epic,
        };
    }

    private function roll(Task $task, string $salt, int $modulo): int
    {
        $key = (string) config('app.key', 'runeday');
        $hash = hash_hmac(
            'sha256',
            $task->user_id.':'.$task->id.':'.$task->difficulty->value.':'.$salt,
            $key,
        );

        return ((int) hexdec(substr($hash, 0, 8))) % max(1, $modulo);
    }
}
