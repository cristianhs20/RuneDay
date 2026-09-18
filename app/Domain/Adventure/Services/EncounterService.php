<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Models\RegionProgress;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Services\CharacterStats;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EncounterService
{
    public function __construct(
        private readonly WorldAccessService $access,
        private readonly CharacterStats $stats,
    ) {}

    public function start(User $user, Enemy $enemy): Encounter
    {
        return DB::transaction(function () use ($user, $enemy) {
            $enemy = Enemy::query()->with('region')->lockForUpdate()->findOrFail($enemy->id);
            $character = CharacterProfile::firstOrCreate(['user_id' => $user->id]);

            if (! $character->character_created_at) {
                throw ValidationException::withMessages([
                    'character' => 'Create your hero before entering the world.',
                ]);
            }

            if (! $this->access->enemyUnlocked($user, $enemy)) {
                throw ValidationException::withMessages([
                    'enemy' => 'This encounter is still locked.',
                ]);
            }

            if (Encounter::query()
                ->where('user_id', $user->id)
                ->where('status', EncounterStatus::Active->value)
                ->exists()) {
                throw ValidationException::withMessages([
                    'encounter' => 'Finish or abandon your current encounter first.',
                ]);
            }

            $stats = $this->stats->for($user);
            $heroMaxHp = 100 + ($stats['guard'] * 6);

            AdventureProfile::firstOrCreate(['user_id' => $user->id]);

            $progress = RegionProgress::firstOrCreate([
                'user_id' => $user->id,
                'region_id' => $enemy->region_id,
            ]);

            if (! $progress->first_entered_at) {
                $progress->forceFill(['first_entered_at' => now()])->save();
            }

            return Encounter::create([
                'user_id' => $user->id,
                'region_id' => $enemy->region_id,
                'enemy_id' => $enemy->id,
                'status' => EncounterStatus::Active->value,
                'enemy_hp_remaining' => $enemy->max_hp,
                'hero_hp_remaining' => $heroMaxHp,
                'hero_max_hp' => $heroMaxHp,
                'snapshot' => [
                    'enemy' => [
                        'name' => $enemy->name,
                        'type' => $enemy->type->value,
                        'max_hp' => $enemy->max_hp,
                        'attack' => $enemy->attack,
                        'defense' => $enemy->defense,
                    ],
                    'hero_stats' => $stats,
                ],
                'started_at' => now(),
            ])->load(['enemy', 'region']);
        });
    }

    public function abandon(User $user, Encounter $encounter): Encounter
    {
        abort_unless($encounter->user_id === $user->id, 403);

        if ($encounter->status !== EncounterStatus::Active) {
            return $encounter;
        }

        $encounter->forceFill([
            'status' => EncounterStatus::Abandoned->value,
            'completed_at' => now(),
        ])->save();

        return $encounter->fresh();
    }

    public function activeFor(User $user): ?Encounter
    {
        return Encounter::query()
            ->where('user_id', $user->id)
            ->where('status', EncounterStatus::Active->value)
            ->with(['enemy.region', 'region'])
            ->latest('started_at')
            ->first();
    }
}
