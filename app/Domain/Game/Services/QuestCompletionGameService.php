<?php

namespace App\Domain\Game\Services;

use App\Domain\Productivity\Models\Task;

class QuestCompletionGameService
{
    public function __construct(
        private readonly RewardEngine $rewards,
        private readonly LootEngine $loot,
        private readonly AchievementEngine $achievements,
    ) {}

    /**
     * @param  array<string, mixed>  $metadata
     * @return array{
     *     granted: bool,
     *     xp: int,
     *     gold: int,
     *     loot: array<string, mixed>|null,
     *     achievements: array<int, array<string, mixed>>
     * }
     */
    public function handle(
        Task $task,
        int $xp,
        int $gold,
        float $rewardFactor,
        array $metadata = [],
    ): array {
        $reward = $this->rewards->grant(
            $task->user_id,
            'task_completion',
            $task->id,
            $xp,
            $gold,
            $metadata,
        );

        $lootResult = $this->loot->rollForTask($task, $rewardFactor);
        $inventoryItem = $lootResult['inventory_item'];
        $loot = null;

        if ($lootResult['drop']->dropped && $inventoryItem) {
            $item = $inventoryItem->item;

            $loot = [
                'inventory_item_id' => $inventoryItem->id,
                'slug' => $item->slug,
                'name' => $item->name,
                'description' => $item->description,
                'slot' => $item->slot?->value,
                'rarity' => $item->rarity->value,
                'visual_key' => $item->visual_key,
                'stats' => $item->stats ?? [],
            ];
        }

        $user = $task->user()->firstOrFail();
        $achievements = $this->achievements->evaluate($user);

        return [
            ...$reward,
            'loot' => $loot,
            'achievements' => $achievements,
        ];
    }
}
