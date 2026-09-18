<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CharacterEnginePhaseATest extends TestCase
{
    use RefreshDatabase;

    public function test_character_style_lab_requires_authentication(): void
    {
        $this->get('/character/style-lab')
            ->assertRedirect('/login');
    }

    public function test_verified_user_can_open_character_style_lab(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/character/style-lab')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('game/character-style-lab')
            );
    }
}
