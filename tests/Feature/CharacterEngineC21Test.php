<?php

namespace Tests\Feature;

use App\Domain\Game\Services\CharacterSystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CharacterEngineC21Test extends TestCase
{
    use RefreshDatabase;

    public function test_human_broad_c21_art_pass_is_registered_in_shared_contract(): void
    {
        $system = app(CharacterSystem::class)->data();
        $artPass = $system['artPasses']['humanBroad'];

        $this->assertSame('human-broad-c2.1', $artPass['id']);
        $this->assertSame('human', $artPass['lineage']);
        $this->assertSame('broad', $artPass['frame']);
        $this->assertSame('implemented', $artPass['status']);
        $this->assertSame(
            ['front', 'side', 'back'],
            $artPass['views'],
        );
    }

    public function test_character_style_source_is_versioned_for_c21(): void
    {
        $source = file_get_contents(
            resource_path('js/game/character-style.ts'),
        );

        $this->assertIsString($source);
        $this->assertStringContainsString(
            "CHARACTER_STYLE_VERSION = '1.2.0'",
            $source,
        );
        $this->assertStringContainsString(
            "id: 'human-broad-c2.1'",
            $source,
        );
    }
}
