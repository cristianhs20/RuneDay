<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Adventure\Models\CombatAction;
use App\Domain\Adventure\Models\Encounter;
use App\Domain\Game\Services\CharacterStats;
use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Domain\Productivity\Models\Task;
use Illuminate\Support\Facades\DB;

class CombatService
{
    public function __construct(
        private readonly CharacterStats $stats,
        private readonly VictoryService $victories,
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function applyTask(Task $task, float $rewardFactor): ?array
    {
        return DB::transaction(function () use ($task, $rewardFactor) {
            $encounter = Encounter::query()
                ->where('user_id', $task->user_id)
                ->where('status', EncounterStatus::Active->value)
                ->with(['enemy', 'region', 'user'])
                ->lockForUpdate()
                ->latest('started_at')
                ->first();

            if (! $encounter) {
                return null;
            }

            $existing = CombatAction::query()
                ->where('user_id', $task->user_id)
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->first();

            if ($existing) {
                return $this->actionPayload($encounter, $existing, null, true);
            }

            $factor = max(0.0, min(1.0, $rewardFactor));

            if ($factor <= 0.0) {
                $action = CombatAction::create([
                    'user_id' => $task->user_id,
                    'encounter_id' => $encounter->id,
                    'task_id' => $task->id,
                    'source_type' => 'task_completion',
                    'source_id' => $task->id,
                    'damage' => 0,
                    'critical' => false,
                    'enemy_damage' => 0,
                    'enemy_hp_after' => $encounter->enemy_hp_remaining,
                    'hero_hp_after' => $encounter->hero_hp_remaining,
                    'rested' => false,
                    'reward_factor' => 0,
                    'metadata' => [
                        'difficulty' => $task->difficulty->value,
                        'capped' => true,
                    ],
                ]);

                return $this->actionPayload($encounter, $action, null, false);
            }

            $stats = $this->stats->for($encounter->user);
            $enemy = $encounter->enemy;

            $baseDamage = match ($task->difficulty) {
                TaskDifficulty::Easy => 8,
                TaskDifficulty::Normal => 14,
                TaskDifficulty::Hard => 24,
                TaskDifficulty::Epic => 40,
            };

            $rawDamage = $baseDamage + (int) floor($stats['power'] * 0.75);
            $mitigated = max(2, $rawDamage - (int) floor($enemy->defense * 0.5));
            $damage = max(1, (int) floor($mitigated * $factor));

            $criticalChance = min(
                3500,
                500 + ($stats['focus'] * 120) + ($stats['luck'] * 80),
            );
            $criticalRoll = $this->roll($encounter, $task, 'critical', 10000);
            $critical = $criticalRoll < $criticalChance;

            if ($critical) {
                $damage = (int) floor($damage * 1.6);
            }

            $damage = min($damage, $encounter->enemy_hp_remaining);
            $enemyHpAfter = max(0, $encounter->enemy_hp_remaining - $damage);
            $enemyDamage = 0;
            $rested = false;
            $heroHpAfter = $encounter->hero_hp_remaining;

            if ($enemyHpAfter > 0) {
                $enemyDamage = max(
                    1,
                    $enemy->attack - (int) floor($stats['guard'] * 0.7),
                );
                $heroHpAfter = max(0, $heroHpAfter - $enemyDamage);

                if ($heroHpAfter <= 0) {
                    $rested = true;
                    $heroHpAfter = $encounter->hero_max_hp;
                }
            }

            $encounter->forceFill([
                'enemy_hp_remaining' => $enemyHpAfter,
                'hero_hp_remaining' => $heroHpAfter,
                'damage_dealt' => $encounter->damage_dealt + $damage,
                'turns' => $encounter->turns + 1,
                'rests' => $encounter->rests + ($rested ? 1 : 0),
                'completed_at' => $enemyHpAfter === 0 ? now() : null,
            ])->save();

            AdventureProfile::firstOrCreate(['user_id' => $task->user_id]);
            $profile = AdventureProfile::query()
                ->where('user_id', $task->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $profile->forceFill([
                'total_damage' => $profile->total_damage + $damage,
            ])->save();

            $action = CombatAction::create([
                'user_id' => $task->user_id,
                'encounter_id' => $encounter->id,
                'task_id' => $task->id,
                'source_type' => 'task_completion',
                'source_id' => $task->id,
                'damage' => $damage,
                'critical' => $critical,
                'enemy_damage' => $enemyDamage,
                'enemy_hp_after' => $enemyHpAfter,
                'hero_hp_after' => $heroHpAfter,
                'rested' => $rested,
                'reward_factor' => $factor,
                'metadata' => [
                    'difficulty' => $task->difficulty->value,
                    'base_damage' => $baseDamage,
                    'power' => $stats['power'],
                    'guard' => $stats['guard'],
                    'focus' => $stats['focus'],
                    'luck' => $stats['luck'],
                    'critical_roll' => $criticalRoll,
                    'critical_chance' => $criticalChance,
                ],
            ]);

            $victoryRewards = $enemyHpAfter === 0
                ? $this->victories->settle($encounter)
                : null;

            $encounter->refresh();

            return $this->actionPayload(
                $encounter,
                $action,
                $victoryRewards,
                false,
            );
        });
    }

    /**
     * @param  array<string, mixed>|null  $victoryRewards
     * @return array<string, mixed>
     */
    private function actionPayload(
        Encounter $encounter,
        CombatAction $action,
        ?array $victoryRewards,
        bool $duplicate,
    ): array {
        $enemy = $encounter->enemy;

        return [
            'encounter_id' => $encounter->id,
            'duplicate' => $duplicate,
            'capped' => $action->reward_factor <= 0,
            'damage' => $action->damage,
            'critical' => $action->critical,
            'enemy_damage' => $action->enemy_damage,
            'enemy_hp_remaining' => $action->enemy_hp_after,
            'enemy_max_hp' => $enemy->max_hp,
            'hero_hp_remaining' => $action->hero_hp_after,
            'hero_max_hp' => $encounter->hero_max_hp,
            'rested' => $action->rested,
            'victory' => $action->enemy_hp_after <= 0,
            'enemy' => [
                'slug' => $enemy->slug,
                'name' => $enemy->name,
                'type' => $enemy->type->value,
                'visual_key' => $enemy->visual_key,
            ],
            'rewards' => $victoryRewards,
        ];
    }

    private function roll(
        Encounter $encounter,
        Task $task,
        string $salt,
        int $modulo,
    ): int {
        $key = (string) config('app.key', 'runeday');
        $hash = hash_hmac(
            'sha256',
            $encounter->id.':'.$task->id.':'.$task->user_id.':'.$salt,
            $key,
        );

        return ((int) hexdec(substr($hash, 0, 8))) % max(1, $modulo);
    }
}
