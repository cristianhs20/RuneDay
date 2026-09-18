<?php

namespace Tests\Feature;

use App\Domain\Game\Models\Achievement;
use App\Domain\Game\Models\AchievementUnlock;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\EquippedItem;
use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Models\ItemDefinition;
use App\Domain\Game\Models\LootDrop;
use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Game\Services\AchievementEngine;
use App\Domain\Productivity\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2GameTest extends TestCase
{
    use RefreshDatabase;

    public function test_phase_two_catalog_is_available_after_migrations(): void
    {
        $this->assertSame(24, ItemDefinition::count());
        $this->assertSame(7, Achievement::count());
        $this->assertSame(
            6,
            ItemDefinition::query()->where('rarity', 'epic')->count(),
        );
        $this->assertSame(
            0,
            ItemDefinition::query()
                ->where('rarity', 'epic')
                ->where('shop_enabled', true)
                ->count(),
        );
    }

    public function test_creating_a_hero_grants_and_equips_starter_gear(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->put('/character', [
            'character_name' => 'Astra',
            'archetype' => 'warden',
            'appearance' => [
                'body' => 'type_b',
                'skin_tone' => 'bronze',
                'hair_style' => 'wild',
                'hair_color' => 'silver',
                'eye_color' => 'azure',
            ],
        ])->assertRedirect();

        $profile = CharacterProfile::where('user_id', $user->id)->firstOrFail();

        $this->assertSame('Astra', $profile->character_name);
        $this->assertSame('warden', $profile->archetype->value);
        $this->assertNotNull($profile->character_created_at);
        $this->assertSame(2, InventoryItem::where('user_id', $user->id)->count());
        $this->assertSame(2, EquippedItem::where('user_id', $user->id)->count());

        $this->assertDatabaseHas('inventory_items', [
            'user_id' => $user->id,
            'acquired_from' => 'starter',
        ]);
    }

    public function test_equipping_owned_item_replaces_the_slot(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $profile = CharacterProfile::create([
            'user_id' => $user->id,
            'character_name' => 'Rune',
            'appearance' => CharacterProfile::defaultAppearance(),
            'character_created_at' => now(),
        ]);

        $hood = ItemDefinition::where('slug', 'traveler-hood')->firstOrFail();
        $inventory = InventoryItem::create([
            'user_id' => $user->id,
            'item_definition_id' => $hood->id,
            'quantity' => 1,
            'acquired_from' => 'loot',
            'source_type' => 'test',
            'source_id' => $profile->id,
            'acquired_at' => now(),
        ]);

        $this->actingAs($user)
            ->post("/inventory/{$inventory->id}/equip")
            ->assertRedirect();

        $this->assertDatabaseHas('equipped_items', [
            'user_id' => $user->id,
            'slot' => 'head',
            'inventory_item_id' => $inventory->id,
        ]);
    }

    public function test_user_cannot_equip_another_users_inventory_item(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $intruder = User::factory()->create(['email_verified_at' => now()]);
        $item = ItemDefinition::where('slug', 'traveler-hood')->firstOrFail();

        $inventory = InventoryItem::create([
            'user_id' => $owner->id,
            'item_definition_id' => $item->id,
            'quantity' => 1,
            'acquired_from' => 'loot',
            'acquired_at' => now(),
        ]);

        $this->actingAs($intruder)
            ->post("/inventory/{$inventory->id}/equip")
            ->assertForbidden();
    }

    public function test_shop_purchase_spends_gold_and_adds_owned_item_once(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $profile = CharacterProfile::create([
            'user_id' => $user->id,
            'appearance' => CharacterProfile::defaultAppearance(),
            'gold' => 100,
        ]);
        $item = ItemDefinition::where('slug', 'simple-boots')->firstOrFail();

        $this->actingAs($user)
            ->post("/shop/{$item->id}/purchase")
            ->assertRedirect();

        $profile->refresh();
        $this->assertSame(100 - $item->price_gold, $profile->gold);
        $this->assertDatabaseHas('inventory_items', [
            'user_id' => $user->id,
            'item_definition_id' => $item->id,
            'acquired_from' => 'shop',
        ]);
        $this->assertDatabaseHas('reward_transactions', [
            'user_id' => $user->id,
            'source_type' => 'shop_purchase',
            'gold_delta' => -$item->price_gold,
        ]);

        $this->actingAs($user)
            ->post("/shop/{$item->id}/purchase")
            ->assertSessionHasErrors('item');

        $this->assertSame(
            1,
            InventoryItem::query()
                ->where('user_id', $user->id)
                ->where('item_definition_id', $item->id)
                ->count(),
        );
    }

    public function test_quest_completion_records_one_idempotent_loot_roll(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Complete a hard quest',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $drop = LootDrop::query()
            ->where('user_id', $user->id)
            ->where('source_type', 'task_completion')
            ->where('source_id', $task->id)
            ->firstOrFail();

        $this->assertTrue($drop->dropped);
        $this->assertSame('common', $drop->rarity?->value);
        $this->assertNotNull($drop->inventory_item_id);

        $this->actingAs($user)->post("/tasks/{$task->id}/complete");

        $this->assertSame(
            1,
            LootDrop::query()
                ->where('user_id', $user->id)
                ->where('source_type', 'task_completion')
                ->where('source_id', $task->id)
                ->count(),
        );
    }

    public function test_first_quest_unlocks_first_step_achievement_only_once(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $achievement = Achievement::where('slug', 'first-step')->firstOrFail();
        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'The first real quest',
            'difficulty' => 'normal',
            'priority' => 2,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $this->assertDatabaseHas('achievement_unlocks', [
            'user_id' => $user->id,
            'achievement_id' => $achievement->id,
        ]);

        app(AchievementEngine::class)->evaluate($user);

        $this->assertSame(
            1,
            AchievementUnlock::query()
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->count(),
        );
        $this->assertSame(
            1,
            RewardTransaction::query()
                ->where('user_id', $user->id)
                ->where('source_type', 'achievement_unlock')
                ->whereIn(
                    'source_id',
                    AchievementUnlock::query()
                        ->where('user_id', $user->id)
                        ->pluck('id'),
                )
                ->where('metadata->achievement', 'first-step')
                ->count(),
        );
    }

    public function test_phase_two_pages_render_for_verified_user(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->get('/character')->assertOk();
        $this->actingAs($user)->get('/inventory')->assertOk();
        $this->actingAs($user)->get('/shop')->assertOk();
        $this->actingAs($user)->get('/achievements')->assertOk();
    }

    public function test_daily_reward_cap_also_disables_loot_farming(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        CharacterProfile::create([
            'user_id' => $user->id,
            'appearance' => CharacterProfile::defaultAppearance(),
        ]);

        LootDrop::create([
            'user_id' => $user->id,
            'source_type' => 'task_completion',
            'source_id' => 999999,
            'roll' => 9999,
            'dropped' => false,
        ]);

        foreach (range(1, 20) as $index) {
            RewardTransaction::create([
                'user_id' => $user->id,
                'source_type' => 'task_completion',
                'source_id' => 10000 + $index,
                'xp_delta' => 15,
                'gold_delta' => 5,
                'metadata' => ['test' => true],
            ]);
        }

        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Capped quest',
            'difficulty' => 'epic',
            'priority' => 4,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$task->id}/complete")
            ->assertRedirect();

        $drop = LootDrop::query()
            ->where('user_id', $user->id)
            ->where('source_id', $task->id)
            ->firstOrFail();

        $this->assertFalse($drop->dropped);
        $this->assertSame(0, RewardTransaction::query()
            ->where('user_id', $user->id)
            ->where('source_type', 'task_completion')
            ->where('source_id', $task->id)
            ->value('xp_delta'));
    }
}
