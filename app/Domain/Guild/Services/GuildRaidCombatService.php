<?php

namespace App\Domain\Guild\Services;

use App\Domain\Game\Services\CharacterStats;
use App\Domain\Guild\Enums\GuildRaidStatus;
use App\Domain\Guild\Models\GuildMember;
use App\Domain\Guild\Models\GuildRaid;
use App\Domain\Guild\Models\GuildRaidContribution;
use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Domain\Productivity\Models\Task;
use Illuminate\Support\Facades\DB;

class GuildRaidCombatService
{
    public function __construct(
        private readonly CharacterStats $stats,
        private readonly GuildRaidSettlementService $settlement,
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function applyTask(
        GuildMember $membership,
        Task $task,
        float $rewardFactor,
    ): ?array {
        return DB::transaction(function () use ($membership, $task, $rewardFactor) {
            $raid = GuildRaid::query()
                ->where('guild_id', $membership->guild_id)
                ->where('status', GuildRaidStatus::Active->value)
                ->with(['boss', 'guild'])
                ->lockForUpdate()
                ->latest('started_at')
                ->first();

            if (! $raid) {
                return null;
            }

            if ($raid->ends_at->isPast()) {
                $raid->forceFill([
                    'status' => GuildRaidStatus::Expired->value,
                    'completed_at' => now(),
                ])->save();

                return null;
            }

            $existing = GuildRaidContribution::query()
                ->where('user_id', $task->user_id)
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->first();

            if ($existing) {
                return $this->payload($raid, $existing, null, true);
            }

            $factor = max(0.0, min(1.0, $rewardFactor));
            $stats = $this->stats->for($task->user()->firstOrFail());

            $baseDamage = match ($task->difficulty) {
                TaskDifficulty::Easy => 6,
                TaskDifficulty::Normal => 10,
                TaskDifficulty::Hard => 18,
                TaskDifficulty::Epic => 30,
            };

            $damage = 0;
            $critical = false;
            $criticalRoll = 0;
            $criticalChance = 0;

            if ($factor > 0.0) {
                $rawDamage = $baseDamage + (int) floor($stats['power'] * 0.45);
                $damage = max(1, (int) floor($rawDamage * $factor));

                $criticalChance = min(
                    2500,
                    350 + ($stats['focus'] * 80) + ($stats['luck'] * 60),
                );
                $criticalRoll = $this->roll($raid, $task, 10000);
                $critical = $criticalRoll < $criticalChance;

                if ($critical) {
                    $damage = (int) floor($damage * 1.5);
                }

                $damage = min($damage, $raid->hp_remaining);
            }

            $hpAfter = max(0, $raid->hp_remaining - $damage);

            $raid->forceFill([
                'hp_remaining' => $hpAfter,
                'total_damage' => $raid->total_damage + $damage,
                'completed_at' => $hpAfter === 0 ? now() : null,
            ])->save();

            $membership = GuildMember::query()
                ->lockForUpdate()
                ->findOrFail($membership->id);
            $membership->forceFill([
                'raid_damage' => $membership->raid_damage + $damage,
            ])->save();

            $contribution = GuildRaidContribution::create([
                'guild_raid_id' => $raid->id,
                'guild_id' => $membership->guild_id,
                'user_id' => $task->user_id,
                'task_id' => $task->id,
                'source_type' => 'task_completion',
                'source_id' => $task->id,
                'damage' => $damage,
                'critical' => $critical,
                'reward_factor' => $factor,
                'metadata' => [
                    'difficulty' => $task->difficulty->value,
                    'base_damage' => $baseDamage,
                    'power' => $stats['power'],
                    'focus' => $stats['focus'],
                    'luck' => $stats['luck'],
                    'critical_roll' => $criticalRoll,
                    'critical_chance' => $criticalChance,
                ],
            ]);

            $settlement = $hpAfter === 0
                ? $this->settlement->settle($raid)
                : null;

            $raid->refresh();

            return $this->payload(
                $raid,
                $contribution,
                $settlement,
                false,
            );
        });
    }

    /**
     * @param  array<string, mixed>|null  $settlement
     * @return array<string, mixed>
     */
    private function payload(
        GuildRaid $raid,
        GuildRaidContribution $contribution,
        ?array $settlement,
        bool $duplicate,
    ): array {
        return [
            'raid_id' => $raid->id,
            'duplicate' => $duplicate,
            'capped' => $contribution->reward_factor <= 0,
            'damage' => $contribution->damage,
            'critical' => $contribution->critical,
            'hp_remaining' => $raid->hp_remaining,
            'max_hp' => $raid->boss->max_hp,
            'victory' => $raid->hp_remaining <= 0,
            'boss' => [
                'slug' => $raid->boss->slug,
                'name' => $raid->boss->name,
                'visual_key' => $raid->boss->visual_key,
            ],
            'settlement' => $settlement,
        ];
    }

    private function roll(
        GuildRaid $raid,
        Task $task,
        int $modulo,
    ): int {
        $key = (string) config('app.key', 'runeday');
        $hash = hash_hmac(
            'sha256',
            $raid->id.':'.$task->id.':'.$task->user_id.':guild-raid',
            $key,
        );

        return ((int) hexdec(substr($hash, 0, 8))) % max(1, $modulo);
    }
}
