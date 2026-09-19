<?php

namespace Tests\Feature;

use App\Domain\Game\Services\CharacterSystem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CharacterEngineD2Test extends TestCase
{
    use RefreshDatabase;

    public function test_human_broad_d2_master_is_registered_as_sprite_v2_review_asset(): void
    {
        $system = app(CharacterSystem::class)->data();
        $asset = $system['productionAssets']['humanBroadD2'];

        $this->assertSame('human_broad_d2_master', $asset['id']);
        $this->assertSame('runeday-sprite-v2', $asset['engine']);
        $this->assertSame('superseded-by-modular-v3', $asset['status']);
        $this->assertSame('human', $asset['lineage']);
        $this->assertSame('broad', $asset['fit_profile']);
        $this->assertSame(['front', 'side', 'back'], $asset['views']);
        $this->assertSame(
            ['shadow', 'weapon_back', 'body', 'face', 'eyes', 'hair'],
            $asset['layers'],
        );
    }

    public function test_human_broad_d2_manifest_uses_only_png_layers_and_128_cell(): void
    {
        $path = public_path(
            'game/characters/v2/manifests/human-broad-d2.json',
        );

        $manifest = json_decode(
            (string) file_get_contents($path),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $this->assertSame('runeday-sprite-v2', $manifest['engine']);
        $this->assertSame(
            ['width' => 128, 'height' => 128],
            $manifest['cell'],
        );

        foreach (['front', 'side', 'back'] as $view) {
            $layers = $manifest['views'][$view]['idle'];

            $this->assertCount(6, $layers);

            foreach ($layers as $layer) {
                $this->assertStringEndsWith('.png', $layer['sheet']);
                $this->assertSame(1, $layer['frames']);
            }
        }
    }

    public function test_human_broad_d2_png_assets_are_real_128_square_images(): void
    {
        $root = public_path(
            'game/characters/v2/characters/human/broad/master',
        );

        foreach (['front', 'side', 'back'] as $view) {
            $master = getimagesize($root.'/'.$view.'-master.png');

            $this->assertIsArray($master);
            $this->assertSame(128, $master[0]);
            $this->assertSame(128, $master[1]);
            $this->assertSame(IMAGETYPE_PNG, $master[2]);

            foreach ([
                'shadow',
                'weapon_back',
                'body',
                'face',
                'eyes',
                'hair',
            ] as $layer) {
                $info = getimagesize(
                    $root.'/'.$view.'-'.$layer.'.png',
                );

                $this->assertIsArray($info);
                $this->assertSame(128, $info[0]);
                $this->assertSame(128, $info[1]);
                $this->assertSame(IMAGETYPE_PNG, $info[2]);
            }
        }
    }

    public function test_sprite_v2_lab_requires_authentication_and_renders_for_user(): void
    {
        $this->get('/character/sprite-v2-lab')
            ->assertRedirect('/login');

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/character/sprite-v2-lab')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/sprite-v2-lab')
            );
    }
}
