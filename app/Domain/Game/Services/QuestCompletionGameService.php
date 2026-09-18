<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Productivity\Models\Task;
use App\Domain\Social\Services\SocialActivityPublisher;

class QuestCompletionGameService
{
    public function __construct(
        private readonly RewardEngine $rewards,
        private readonly LootEngine $loot,
        private readonly AchievementEngine $achievements,
        private readonly SocialActivityPublisher $social,
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
        $levelBefore = CharacterProfile::firstOrCreate([
            'user_id' => $task->user_id,
        ])->level;

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

        $profile = CharacterProfile::where('user_id', $task->user_id)
            ->firstOrFail();
        $profile->refresh();

        if ($profile->level > $levelBefore) {
            $this->social->publish(
                $user,
                'level_up',
                'level_up',
                $profile->level,
                ['level' => $profile->level],
            );
        }

        if (
            $inventoryItem
            && in_array($inventoryItem->item->rarity->value, ['rare', 'epic'], true)
        ) {
            $item = $inventoryItem->item;

            $this->social->publish(
                $user,
                'loot_found',
                'loot_drop',
                $lootResult['drop']->id,
                [
                    'name' => $item->name,
                    'rarity' => $item->rarity->value,
                    'slot' => $item->slot?->value,
                ],
            );
        }

        return [
            ...$reward,
            'loot' => $loot,
            'achievements' => $achievements,
        ];
    }
}
