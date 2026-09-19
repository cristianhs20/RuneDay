<?php

namespace Tests\Feature;

use App\Domain\Game\Services\CharacterSystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CharacterEnginePhaseDTest extends TestCase
{
    use RefreshDatabase;

    public function test_sprite_engine_v2_is_the_official_production_target(): void
    {
        $system = app(CharacterSystem::class)->data();
        $pipeline = $system['visualPipeline'];

        $this->assertSame(
            'prototype-svg-v1',
            $pipeline['prototypeRenderer']['id'],
        );
        $this->assertSame(
            'deprecated-for-production-art',
            $pipeline['prototypeRenderer']['status'],
        );

        $this->assertSame(
            'runeday-modular-v3',
            $pipeline['productionRenderer']['id'],
        );
        $this->assertSame(
            'official-target',
            $pipeline['productionRenderer']['status'],
        );
        $this->assertSame(
            'authored-pixel-art-atlas-modules',
            $pipeline['productionRenderer']['assetFormat'],
        );
        $this->assertSame(
            ['width' => 256, 'height' => 256],
            $pipeline['productionRenderer']['cell'],
        );
    }

    public function test_sprite_manifest_v2_schema_is_valid_json_and_uses_128_cell(): void
    {
        $path = resource_path('game/sprite-v2/manifest.schema.json');
        $contents = file_get_contents($path);

        $this->assertIsString($contents);

        $schema = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame(
            'RuneDay Sprite Manifest v2',
            $schema['title'],
        );
        $this->assertSame(
            'runeday-sprite-v2',
            $schema['properties']['engine']['const'],
        );
        $this->assertSame(
            128,
            $schema['properties']['cell']['properties']['width']['const'],
        );
        $this->assertSame(
            128,
            $schema['properties']['cell']['properties']['height']['const'],
        );
    }
}
