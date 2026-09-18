<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Domain\Adventure\Enums\EnemyType;
use App\Domain\Adventure\Models\AdventureObjective;
use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Adventure\Models\CombatAction;
use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Models\ObjectiveClaim;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Models\RegionProgress;
use App\Models\User;

class WorldSnapshot
{
    public function __construct(
        private readonly WorldAccessService $access,
        private readonly ObjectiveEngine $objectives,
        private readonly EncounterService $encounters,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $profile = AdventureProfile::firstOrCreate(['user_id' => $user->id]);

        $progressByRegion = RegionProgress::query()
            ->where('user_id', $user->id)
            ->get()
            ->keyBy('region_id');

        $claimedIds = ObjectiveClaim::query()
            ->where('user_id', $user->id)
            ->pluck('objective_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $victoriesByEnemy = Encounter::query()
            ->where('user_id', $user->id)
            ->where('status', EncounterStatus::Victory->value)
            ->selectRaw('enemy_id, count(*) as wins')
            ->groupBy('enemy_id')
            ->pluck('wins', 'enemy_id');

        $encounteredEnemyIds = Encounter::query()
            ->where('user_id', $user->id)
            ->pluck('enemy_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        $regions = Region::query()
            ->with([
                'enemies' => fn ($query) => $query->orderBy('sort_order'),
                'objectives' => fn ($query) => $query->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->get();

        $regionRows = [];

        foreach ($regions as $region) {
            /** @var RegionProgress|null $regionProgress */
            $regionProgress = $progressByRegion->get($region->id);

            $unlocked = $this->access->regionUnlocked($user, $region);
            $bossUnlocked = $this->access->bossUnlocked($user, $region);

            $enemyRows = [];

            foreach ($region->enemies as $enemy) {
                /** @var Enemy $enemy */
                $enemyRows[] = [
                    'id' => $enemy->id,
                    'slug' => $enemy->slug,
                    'name' => $enemy->name,
                    'description' => $enemy->description,
                    'type' => $enemy->type->value,
                    'visual_key' => $enemy->visual_key,
                    'max_hp' => $enemy->max_hp,
                    'attack' => $enemy->attack,
                    'defense' => $enemy->defense,
                    'reward_gold' => $enemy->reward_gold,
                    'reward_renown' => $enemy->reward_renown,
                    'unlocked' => $unlocked && (
                        $enemy->type !== EnemyType::Boss || $bossUnlocked
                    ),
                    'encountered' => in_array(
                        $enemy->id,
                        $encounteredEnemyIds,
                        true,
                    ),
                    'wins' => (int) ($victoriesByEnemy[$enemy->id] ?? 0),
                ];
            }

            $objectiveRows = [];

            foreach ($region->objectives as $objective) {
                /** @var AdventureObjective $objective */
                $objectiveRows[] = [
                    'id' => $objective->id,
                    'slug' => $objective->slug,
                    'name' => $objective->name,
                    'description' => $objective->description,
                    'threshold' => $objective->threshold,
                    'progress' => min(
                        $objective->threshold,
                        $this->objectives->progress(
                            $user,
                            $region,
                            $objective->criteria_type,
                        ),
                    ),
                    'reward_gold' => $objective->reward_gold,
                    'reward_renown' => $objective->reward_renown,
                    'claimed' => in_array(
                        $objective->id,
                        $claimedIds,
                        true,
                    ),
                ];
            }

            $regionRows[] = [
                'id' => $region->id,
                'slug' => $region->slug,
                'name' => $region->name,
                'description' => $region->description,
                'visual_key' => $region->visual_key,
                'min_level' => $region->min_level,
                'unlocked' => $unlocked,
                'boss_unlocked' => $bossUnlocked,
                'progress' => [
                    'enemy_victories' => $regionProgress
                        ? $regionProgress->enemy_victories
                        : 0,
                    'boss_required_victories' => $region->boss_unlock_victories,
                    'boss_defeated' => $regionProgress
                        ? $regionProgress->boss_defeated_at !== null
                        : false,
                ],
                'enemies' => $enemyRows,
                'objectives' => $objectiveRows,
            ];
        }

        $active = $this->encounters->activeFor($user);

        return [
            'profile' => [
                'renown' => $profile->renown,
                'total_damage' => $profile->total_damage,
                'victories' => $profile->victories,
                'boss_victories' => $profile->boss_victories,
            ],
            'active_encounter' => $active
                ? $this->encounterPayload($active)
                : null,
            'regions' => $regionRows,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function encounterPayload(Encounter $encounter): array
    {
        $actions = CombatAction::query()
            ->where('encounter_id', $encounter->id)
            ->latest('id')
            ->limit(5)
            ->get();

        $actionRows = [];

        foreach ($actions as $action) {
            $actionRows[] = [
                'id' => $action->id,
                'damage' => $action->damage,
                'critical' => $action->critical,
                'enemy_damage' => $action->enemy_damage,
                'rested' => $action->rested,
                'capped' => $action->reward_factor <= 0,
                'created_at' => $action->created_at?->toISOString(),
            ];
        }

        return [
            'id' => $encounter->id,
            'status' => $encounter->status->value,
            'enemy_hp_remaining' => $encounter->enemy_hp_remaining,
            'hero_hp_remaining' => $encounter->hero_hp_remaining,
            'hero_max_hp' => $encounter->hero_max_hp,
            'damage_dealt' => $encounter->damage_dealt,
            'turns' => $encounter->turns,
            'rests' => $encounter->rests,
            'started_at' => $encounter->started_at->toISOString(),
            'enemy' => [
                'id' => $encounter->enemy->id,
                'slug' => $encounter->enemy->slug,
                'name' => $encounter->enemy->name,
                'description' => $encounter->enemy->description,
                'type' => $encounter->enemy->type->value,
                'visual_key' => $encounter->enemy->visual_key,
                'max_hp' => $encounter->enemy->max_hp,
                'attack' => $encounter->enemy->attack,
                'defense' => $encounter->enemy->defense,
            ],
            'region' => [
                'slug' => $encounter->region->slug,
                'name' => $encounter->region->name,
            ],
            'recent_actions' => $actionRows,
        ];
    }
}
