<?php

namespace Tests\Feature;

use App\Domain\Game\Services\CharacterSystem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CharacterEngineSpriteForgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_sprite_forge_is_the_official_renderer_for_every_lineage(): void
    {
        $system = app(CharacterSystem::class)->data();
        $renderer = $system['visualPipeline']['productionRenderer'];

        $this->assertSame('runeday-sprite-forge', $renderer['id']);
        $this->assertSame('official-target', $renderer['status']);
        $this->assertSame('rig-driven-pixel-raster', $renderer['assetFormat']);
        $this->assertSame(['width' => 64, 'height' => 64], $renderer['cell']);
        $this->assertSame(
            array_keys($system['lineages']),
            $renderer['lineages'],
        );
        $this->assertSame($system['views'], $renderer['views']);
    }

    public function test_modular_v3_is_marked_superseded(): void
    {
        $pipeline = app(CharacterSystem::class)->data()['visualPipeline'];

        $this->assertSame(
            'superseded-by-sprite-forge',
            $pipeline['modularV3Renderer']['status'],
        );
    }

    public function test_sprite_forge_lab_is_protected_and_renders_for_verified_user(): void
    {
        $this->get('/character/sprite-forge')->assertRedirect('/login');

        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->get('/character/sprite-forge')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/sprite-forge-lab')
            );
    }

    public function test_old_modular_v3_lab_redirects_to_sprite_forge(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->get('/character/modular-v3-lab')
            ->assertRedirect('/character/sprite-forge');
    }
}
