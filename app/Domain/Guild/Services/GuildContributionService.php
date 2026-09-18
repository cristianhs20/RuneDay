<?php

namespace App\Domain\Guild\Services;

use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\GuildContribution;
use App\Domain\Guild\Models\GuildMember;
use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Domain\Productivity\Models\Task;
use Illuminate\Support\Facades\DB;

class GuildContributionService
{
    public function __construct(
        private readonly GuildXpService $guildXp,
        private readonly GuildRaidCombatService $raids,
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function applyTask(Task $task, float $rewardFactor): ?array
    {
        return DB::transaction(function () use ($task, $rewardFactor) {
            $membership = GuildMember::query()
                ->where('user_id', $task->user_id)
                ->with('guild')
                ->lockForUpdate()
                ->first();

            if (! $membership) {
                return null;
            }

            $existing = GuildContribution::query()
                ->where('user_id', $task->user_id)
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->first();

            if ($existing) {
                return [
                    'duplicate' => true,
                    'guild_id' => $membership->guild_id,
                    'guild_tag' => $membership->guild->tag,
                    'guild_xp' => $existing->guild_xp,
                    'hall_upgraded' => false,
                    'hall' => app(GuildHallService::class)->for(
                        $membership->guild,
                    ),
                    'raid' => null,
                ];
            }

            $factor = max(0.0, min(1.0, $rewardFactor));

            $baseXp = match ($task->difficulty) {
                TaskDifficulty::Easy => 3,
                TaskDifficulty::Normal => 6,
                TaskDifficulty::Hard => 12,
                TaskDifficulty::Epic => 20,
            };

            $xp = (int) floor($baseXp * $factor);

            $contribution = GuildContribution::create([
                'guild_id' => $membership->guild_id,
                'user_id' => $task->user_id,
                'task_id' => $task->id,
                'source_type' => 'task_completion',
                'source_id' => $task->id,
                'guild_xp' => $xp,
                'reward_factor' => $factor,
                'metadata' => [
                    'difficulty' => $task->difficulty->value,
                    'base_guild_xp' => $baseXp,
                ],
            ]);

            $guild = Guild::query()
                ->lockForUpdate()
                ->findOrFail($membership->guild_id);

            $guildReward = $this->guildXp->grant(
                $guild,
                $task->user_id,
                'task_completion',
                $task->id,
                $xp,
                [
                    'difficulty' => $task->difficulty->value,
                    'reward_factor' => $factor,
                    'contribution_id' => $contribution->id,
                ],
            );

            $membership->forceFill([
                'contribution_xp' => $membership->contribution_xp + $xp,
                'contribution_tasks' => $membership->contribution_tasks + 1,
            ])->save();

            $raid = $this->raids->applyTask(
                $membership,
                $task,
                $factor,
            );

            return [
                'duplicate' => false,
                'guild_id' => $guild->id,
                'guild_tag' => $guild->tag,
                'guild_xp' => $xp,
                'hall_upgraded' => $guildReward['hall_upgraded'],
                'hall' => $guildReward['hall_after'],
                'raid' => $raid,
            ];
        });
    }
}
