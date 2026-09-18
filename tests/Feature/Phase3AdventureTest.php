<?php

namespace Tests\Feature;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Domain\Adventure\Models\AdventureObjective;
use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Adventure\Models\AdventureTransaction;
use App\Domain\Adventure\Models\CombatAction;
use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Models\ObjectiveClaim;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Models\RegionProgress;
use App\Domain\Adventure\Services\WorldAccessService;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Productivity\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3AdventureTest extends TestCase
{
    use RefreshDatabase;

    public function test_phase_three_world_catalog_is_available_after_migrations(): void
    {
        $this->assertSame(3, Region::count());
        $this->assertSame(9, Enemy::count());
        $this->assertSame(9, AdventureObjective::count());
        $this->assertSame(
            3,
            Enemy::query()->where('type', 'boss')->count(),
        );
    }

    public function test_adventure_requires_a_created_hero(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $enemy = Enemy::where('slug', 'mossling')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$enemy->id}/encounter")
            ->assertSessionHasErrors('character');

        $this->assertDatabaseCount('adventure_encounters', 0);
    }

    public function test_first_region_is_open_and_later_regions_are_gated(): void
    {
        $user = $this->hero(level: 1);
        $access = app(WorldAccessService::class);

        $greenwild = Region::where('slug', 'greenwild-frontier')->firstOrFail();
        $embercrag = Region::where('slug', 'embercrag')->firstOrFail();

        $this->assertTrue($access->regionUnlocked($user, $greenwild));
        $this->assertFalse($access->regionUnlocked($user, $embercrag));

        $profile = CharacterProfile::where('user_id', $user->id)->firstOrFail();
        $profile->forceFill(['level' => 3])->save();

        RegionProgress::create([
            'user_id' => $user->id,
            'region_id' => $greenwild->id,
            'boss_defeated_at' => now(),
        ]);

        $this->assertTrue($access->regionUnlocked($user, $embercrag));
    }

    public function test_boss_requires_region_victories_before_it_can_start(): void
    {
        $user = $this->hero();
        $region = Region::where('slug', 'greenwild-frontier')->firstOrFail();
        $boss = Enemy::where('slug', 'root-warden')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$boss->id}/encounter")
            ->assertSessionHasErrors('enemy');

        RegionProgress::create([
            'user_id' => $user->id,
            'region_id' => $region->id,
            'enemy_victories' => $region->boss_unlock_victories,
        ]);

        $this->actingAs($user)
            ->post("/adventure/enemies/{$boss->id}/encounter")
            ->assertRedirect();

        $this->assertDatabaseHas('adventure_encounters', [
            'user_id' => $user->id,
            'enemy_id' => $boss->id,
            'status' => 'active',
        ]);
    }

    public function test_only_one_active_encounter_can_exist_per_user(): void
    {
        $user = $this->hero();
        $mossling = Enemy::where('slug', 'mossling')->firstOrFail();
        $wolf = Enemy::where('slug', 'thorn-wolf')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$mossling->id}/encounter")
            ->assertRedirect();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$wolf->id}/encounter")
            ->assertSessionHasErrors('encounter');

        $this->assertSame(
            1,
            Encounter::query()
                ->where('user_id', $user->id)
                ->where('status', EncounterStatus::Active->value)
                ->count(),
        );
    }

    public function test_completed_real_quest_becomes_one_combat_action(): void
    {
        $user = $this->hero();
        $enemy = Enemy::where('slug', 'thorn-wolf')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$enemy->id}/encounter")
            ->assertRedirect();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Ship the onboarding screen',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $action = CombatAction::where('task_id', $task->id)->firstOrFail();
        $this->assertGreaterThan(0, $action->damage);

        $encounter = Encounter::where('user_id', $user->id)
            ->latest('id')
            ->firstOrFail();
        $damageAfterFirst = $encounter->damage_dealt;

        $this->actingAs($user)->post("/tasks/{$task->id}/complete");

        $this->assertSame(
            1,
            CombatAction::query()
                ->where('user_id', $user->id)
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->count(),
        );
        $this->assertSame(
            $damageAfterFirst,
            $encounter->fresh()->damage_dealt,
        );
    }

    public function test_daily_reward_cap_also_stops_adventure_damage(): void
    {
        $user = $this->hero();
        $enemy = Enemy::where('slug', 'thorn-wolf')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$enemy->id}/encounter")
            ->assertRedirect();

        foreach (range(1, 20) as $index) {
            RewardTransaction::create([
                'user_id' => $user->id,
                'source_type' => 'task_completion',
                'source_id' => 50000 + $index,
                'xp_delta' => 15,
                'gold_delta' => 5,
                'metadata' => ['test' => true],
            ]);
        }

        $encounter = Encounter::where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();
        $hpBefore = $encounter->enemy_hp_remaining;

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Capped adventure quest',
            'difficulty' => 'epic',
            'priority' => 4,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $action = CombatAction::where('task_id', $task->id)->firstOrFail();
        $this->assertSame(0, $action->damage);
        $this->assertSame(0.0, $action->reward_factor);
        $this->assertSame(
            $hpBefore,
            $encounter->fresh()->enemy_hp_remaining,
        );
    }

    public function test_zero_hp_triggers_camp_rest_without_resetting_enemy_progress(): void
    {
        $user = $this->hero();
        $enemy = Enemy::where('slug', 'thorn-wolf')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$enemy->id}/encounter")
            ->assertRedirect();

        $encounter = Encounter::where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $encounter->forceFill([
            'hero_hp_remaining' => 1,
            'enemy_hp_remaining' => $enemy->max_hp,
        ])->save();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Deep work block',
            'difficulty' => 'easy',
            'priority' => 2,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $action = CombatAction::where('task_id', $task->id)->firstOrFail();
        $encounter->refresh();

        $this->assertTrue($action->rested);
        $this->assertSame(
            $encounter->hero_max_hp,
            $encounter->hero_hp_remaining,
        );
        $this->assertGreaterThan(0, $encounter->damage_dealt);
        $this->assertLessThan($enemy->max_hp, $encounter->enemy_hp_remaining);
    }

    public function test_victory_awards_gold_renown_and_region_objective_once(): void
    {
        $user = $this->hero();
        $enemy = Enemy::where('slug', 'mossling')->firstOrFail();

        $this->actingAs($user)
            ->post("/adventure/enemies/{$enemy->id}/encounter")
            ->assertRedirect();

        $encounter = Encounter::where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();
        $encounter->forceFill(['enemy_hp_remaining' => 1])->save();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Finish a meaningful quest',
            'difficulty' => 'easy',
            'priority' => 2,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $encounter->refresh();
        $this->assertSame(EncounterStatus::Victory, $encounter->status);
        $this->assertNotNull($encounter->settled_at);

        $this->assertDatabaseHas('reward_transactions', [
            'user_id' => $user->id,
            'source_type' => 'adventure_victory',
            'source_id' => $encounter->id,
            'gold_delta' => $enemy->reward_gold,
        ]);
        $this->assertDatabaseHas('adventure_transactions', [
            'user_id' => $user->id,
            'source_type' => 'adventure_victory',
            'source_id' => $encounter->id,
            'renown_delta' => $enemy->reward_renown,
        ]);

        $firstBlood = AdventureObjective::where(
            'slug',
            'greenwild-first-blood',
        )->firstOrFail();

        $this->assertDatabaseHas('adventure_objective_claims', [
            'user_id' => $user->id,
            'objective_id' => $firstBlood->id,
        ]);

        $profile = AdventureProfile::where('user_id', $user->id)
            ->firstOrFail();
        $this->assertSame(1, $profile->victories);

        $this->actingAs($user)->post("/tasks/{$task->id}/complete");

        $this->assertSame(
            1,
            AdventureTransaction::query()
                ->where('user_id', $user->id)
                ->where('source_type', 'adventure_victory')
                ->where('source_id', $encounter->id)
                ->count(),
        );
        $this->assertSame(
            1,
            ObjectiveClaim::query()
                ->where('user_id', $user->id)
                ->where('objective_id', $firstBlood->id)
                ->count(),
        );
    }

    public function test_first_boss_clear_grants_gear_and_unlocks_next_region(): void
    {
        $user = $this->hero(level: 3);
        $greenwild = Region::where('slug', 'greenwild-frontier')->firstOrFail();
        $embercrag = Region::where('slug', 'embercrag')->firstOrFail();
        $boss = Enemy::where('slug', 'root-warden')->firstOrFail();

        RegionProgress::create([
            'user_id' => $user->id,
            'region_id' => $greenwild->id,
            'enemy_victories' => $greenwild->boss_unlock_victories,
        ]);

        $this->actingAs($user)
            ->post("/adventure/enemies/{$boss->id}/encounter")
            ->assertRedirect();

        $encounter = Encounter::where('user_id', $user->id)
            ->where('enemy_id', $boss->id)
            ->where('status', 'active')
            ->firstOrFail();
        $encounter->forceFill(['enemy_hp_remaining' => 1])->save();

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Defeat the first boss',
            'difficulty' => 'epic',
            'priority' => 4,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $progress = RegionProgress::where('user_id', $user->id)
            ->where('region_id', $greenwild->id)
            ->firstOrFail();

        $this->assertNotNull($progress->boss_defeated_at);
        $this->assertTrue(
            app(WorldAccessService::class)->regionUnlocked(
                $user,
                $embercrag,
            ),
        );
        $this->assertDatabaseHas('inventory_items', [
            'user_id' => $user->id,
            'acquired_from' => 'boss',
            'source_type' => 'boss_first_clear',
            'source_id' => $encounter->id,
        ]);
    }

    public function test_adventure_and_bestiary_pages_render(): void
    {
        $user = $this->hero();

        $this->actingAs($user)->get('/adventure')->assertOk();
        $this->actingAs($user)->get('/bestiary')->assertOk();
    }

    private function hero(int $level = 1): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        CharacterProfile::create([
            'user_id' => $user->id,
            'character_name' => 'Rune',
            'archetype' => 'wanderer',
            'appearance' => CharacterProfile::defaultAppearance(),
            'character_created_at' => now(),
            'level' => $level,
            'xp' => 0,
            'total_xp' => max(0, ($level - 1) * 100),
            'gold' => 0,
        ]);

        return $user;
    }
}
