<?php

namespace Tests\Feature;

use App\Domain\Game\Enums\CharacterLineage;
use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Game\Services\CharacterSystem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CharacterEnginePhaseBTest extends TestCase
{
    use RefreshDatabase;

    public function test_shared_character_contract_contains_phase_b_matrix(): void
    {
        $system = app(CharacterSystem::class);
        $data = $system->data();

        $this->assertSame(
            ['human', 'elf', 'skeleton', 'ogre'],
            $system->lineages(),
        );
        $this->assertSame(
            ['front', 'side', 'back'],
            $data['views'],
        );
        $this->assertSame(
            ['idle', 'walk', 'attack', 'cast', 'celebrate', 'hurt'],
            $data['animations'],
        );
        $this->assertSame(
            ['broad', 'lean'],
            $system->allowed('human', 'body'),
        );
        $this->assertSame(
            ['broad', 'lean'],
            $system->allowed('elf', 'body'),
        );
        $this->assertSame(
            ['broad', 'lean'],
            $system->allowed('skeleton', 'body'),
        );
        $this->assertSame(
            ['heavy'],
            $system->allowed('ogre', 'body'),
        );
        $this->assertTrue($data['rig']['sharedEquipmentSockets']);
    }

    public function test_new_character_profile_defaults_to_human_lineage(): void
    {
        $user = User::factory()->create();

        $profile = CharacterProfile::create([
            'user_id' => $user->id,
            'appearance' => CharacterProfile::defaultAppearance(),
        ]);

        $profile->refresh();

        $this->assertSame(
            CharacterLineage::Human,
            $profile->lineage,
        );
        $this->assertSame(
            '1.0.0',
            $profile->character_system_version,
        );
    }

    public function test_legacy_body_frames_are_normalized_to_semantic_frames(): void
    {
        $system = app(CharacterSystem::class);

        $broad = $system->normalizeAppearance('human', [
            'body' => 'type_a',
        ]);
        $lean = $system->normalizeAppearance('human', [
            'body' => 'type_b',
        ]);

        $this->assertSame('broad', $broad['body']);
        $this->assertSame('lean', $lean['body']);
    }

    public function test_legacy_profile_is_normalized_on_snapshot_without_losing_identity(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        CharacterProfile::create([
            'user_id' => $user->id,
            'character_name' => 'Legacy Rune',
            'archetype' => 'rogue',
            'appearance' => [
                'body' => 'type_b',
                'skin_tone' => 'sun',
                'hair_style' => 'wild',
                'hair_color' => 'ember',
                'eye_color' => 'amber',
            ],
            'character_created_at' => now(),
        ]);

        $snapshot = app(CharacterSnapshot::class)->for($user);
        $profile = CharacterProfile::where('user_id', $user->id)
            ->firstOrFail();

        $this->assertSame('human', $snapshot['lineage']);
        $this->assertSame('lean', $snapshot['appearance']['body']);
        $this->assertSame(
            'balanced',
            $snapshot['appearance']['face_style'],
        );
        $this->assertSame(
            app(CharacterSystem::class)->systemVersion(),
            $profile->character_system_version,
        );
    }

    public function test_human_elf_skeleton_and_ogre_can_be_saved_with_valid_frames(): void
    {
        $system = app(CharacterSystem::class);

        foreach ($system->lineages() as $lineage) {
            $user = User::factory()->create([
                'email_verified_at' => now(),
            ]);
            $appearance = $system->defaults($lineage);

            $this->actingAs($user)
                ->put('/character', [
                    'character_name' => ucfirst($lineage).' Rune',
                    'archetype' => 'wanderer',
                    'lineage' => $lineage,
                    'appearance' => $appearance,
                ])
                ->assertRedirect();

            $profile = CharacterProfile::where(
                'user_id',
                $user->id,
            )->firstOrFail();

            $this->assertSame(
                $lineage,
                $profile->lineage?->value,
            );
            $this->assertSame(
                $appearance['body'],
                $profile->appearance['body'],
            );
            $this->assertSame(
                $system->systemVersion(),
                $profile->character_system_version,
            );
        }
    }

    public function test_invalid_frame_lineage_combinations_are_rejected(): void
    {
        $system = app(CharacterSystem::class);

        $ogre = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $ogreAppearance = $system->defaults('ogre');
        $ogreAppearance['body'] = 'lean';

        $this->actingAs($ogre)
            ->put('/character', [
                'character_name' => 'Lean Ogre',
                'archetype' => 'warden',
                'lineage' => 'ogre',
                'appearance' => $ogreAppearance,
            ])
            ->assertSessionHasErrors('appearance.body');

        $human = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $humanAppearance = $system->defaults('human');
        $humanAppearance['body'] = 'heavy';

        $this->actingAs($human)
            ->put('/character', [
                'character_name' => 'Heavy Human',
                'archetype' => 'wanderer',
                'lineage' => 'human',
                'appearance' => $humanAppearance,
            ])
            ->assertSessionHasErrors('appearance.body');
    }

    public function test_skeleton_specific_bone_jaw_and_eye_glow_are_persisted(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $appearance = app(CharacterSystem::class)
            ->defaults('skeleton');

        $appearance['bone_tone'] = 'obsidian';
        $appearance['jaw_style'] = 'cracked';
        $appearance['eye_glow'] = 'violet';

        $this->actingAs($user)
            ->put('/character', [
                'character_name' => 'Vesper Bones',
                'archetype' => 'rogue',
                'lineage' => 'skeleton',
                'appearance' => $appearance,
            ])
            ->assertRedirect();

        $profile = CharacterProfile::where(
            'user_id',
            $user->id,
        )->firstOrFail();

        $this->assertSame(
            'obsidian',
            $profile->appearance['bone_tone'],
        );
        $this->assertSame(
            'cracked',
            $profile->appearance['jaw_style'],
        );
        $this->assertSame(
            'violet',
            $profile->appearance['eye_glow'],
        );
    }

    public function test_ogre_requires_heavy_frame_and_supports_tusks_and_horns(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $appearance = app(CharacterSystem::class)
            ->defaults('ogre');

        $appearance['skin_tone'] = 'stone';
        $appearance['jaw_style'] = 'tusked';
        $appearance['horn_style'] = 'swept';

        $this->actingAs($user)
            ->put('/character', [
                'character_name' => 'Gor',
                'archetype' => 'warden',
                'lineage' => 'ogre',
                'appearance' => $appearance,
            ])
            ->assertRedirect();

        $profile = CharacterProfile::where(
            'user_id',
            $user->id,
        )->firstOrFail();

        $this->assertSame('heavy', $profile->appearance['body']);
        $this->assertSame('stone', $profile->appearance['skin_tone']);
        $this->assertSame('tusked', $profile->appearance['jaw_style']);
        $this->assertSame('swept', $profile->appearance['horn_style']);
    }

    public function test_starter_equipment_catalog_is_shared_between_human_and_ogre(): void
    {
        $system = app(CharacterSystem::class);
        $human = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $ogre = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($human)->put('/character', [
            'character_name' => 'Human Hero',
            'archetype' => 'wanderer',
            'lineage' => 'human',
            'appearance' => $system->defaults('human'),
        ])->assertRedirect();

        $this->actingAs($ogre)->put('/character', [
            'character_name' => 'Ogre Hero',
            'archetype' => 'warden',
            'lineage' => 'ogre',
            'appearance' => $system->defaults('ogre'),
        ])->assertRedirect();

        $humanItems = InventoryItem::query()
            ->where('user_id', $human->id)
            ->with('item')
            ->get()
            ->pluck('item.visual_key')
            ->sort()
            ->values()
            ->all();

        $ogreItems = InventoryItem::query()
            ->where('user_id', $ogre->id)
            ->with('item')
            ->get()
            ->pluck('item.visual_key')
            ->sort()
            ->values()
            ->all();

        $this->assertSame($humanItems, $ogreItems);
        $this->assertContains('weapon_training_sword', $humanItems);
        $this->assertContains('chest_linen_tunic', $humanItems);
    }

    public function test_lineage_lab_requires_authentication_and_renders_for_verified_user(): void
    {
        $this->get('/character/lineage-lab')
            ->assertRedirect('/login');

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/character/lineage-lab')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/character-lineage-lab')
            );
    }
}
