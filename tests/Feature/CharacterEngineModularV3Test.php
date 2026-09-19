<?php

namespace Tests\Feature;

use App\Domain\Game\Services\CharacterSystem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CharacterEngineModularV3Test extends TestCase
{
    use RefreshDatabase;

    public function test_modular_v3_is_the_official_character_renderer(): void
    {
        $system = app(CharacterSystem::class)->data();
        $renderer = $system['visualPipeline']['productionRenderer'];

        $this->assertSame('runeday-modular-v3', $renderer['id']);
        $this->assertSame('official-target', $renderer['status']);
        $this->assertSame(
            'authored-pixel-art-atlas-modules',
            $renderer['assetFormat'],
        );
        $this->assertSame(
            ['width' => 256, 'height' => 256],
            $renderer['cell'],
        );
    }

    public function test_modular_manifest_registers_expected_human_broad_assets(): void
    {
        $manifest = json_decode(
            (string) file_get_contents(
                public_path(
                    'game/characters/v3/manifests/modular-v3.json',
                ),
            ),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $this->assertSame('runeday-modular-v3', $manifest['engine']);
        $this->assertSame('3.0.0', $manifest['version']);
        $this->assertSame(
            ['width' => 256, 'height' => 256],
            $manifest['cell'],
        );
        $this->assertCount(73, $manifest['modules']);

        foreach ([
            'body.fair.front',
            'body.dark.back',
            'head.light_tan.side',
            'hair.messy.front',
            'hair.wild.back',
            'scarf_royal_blue.front',
            'chest_blue_harness.back',
            'belt_starter_tabard.front',
            'boots_starter.side',
            'training_sword.back',
        ] as $module) {
            $this->assertArrayHasKey($module, $manifest['modules']);
        }
    }

    public function test_every_modular_v3_entry_has_an_individual_png_source(): void
    {
        $manifest = json_decode(
            (string) file_get_contents(
                public_path('game/characters/v3/manifests/modular-v3.json'),
            ),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $this->assertCount(73, $manifest['modules']);

        foreach ($manifest['modules'] as $module) {
            $this->assertArrayHasKey('png', $module);

            $path = public_path(ltrim($module['png'], '/'));
            $this->assertFileExists($path);

            $info = getimagesize($path);
            $this->assertIsArray($info);
            $this->assertSame(256, $info[0]);
            $this->assertSame(256, $info[1]);
            $this->assertSame(IMAGETYPE_PNG, $info[2]);
        }
    }

    public function test_all_modular_v3_atlases_exist_as_png_images(): void
    {
        $atlases = [
            'human-broad-base.png' => [1536, 1024],
            'human-broad-hair-face.png' => [1024, 1024],
            'human-broad-starter-equipment.png' => [1280, 768],
            'iron-gold-armor-library.png' => [1280, 1024],
        ];

        foreach ($atlases as $file => [$width, $height]) {
            $path = public_path(
                'game/characters/v3/atlases/'.$file,
            );

            $this->assertFileExists($path);
            $info = getimagesize($path);

            $this->assertIsArray($info);
            $this->assertSame($width, $info[0]);
            $this->assertSame($height, $info[1]);
            $this->assertSame(IMAGETYPE_PNG, $info[2]);
        }
    }

    public function test_modular_v3_lab_is_protected_and_renders_for_verified_user(): void
    {
        $this->get('/character/modular-v3-lab')
            ->assertRedirect('/login');

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/character/modular-v3-lab')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/modular-v3-lab')
            );
    }
}
