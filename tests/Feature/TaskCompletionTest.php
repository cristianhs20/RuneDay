<?php

namespace Tests\Feature;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Productivity\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCompletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_completing_a_quest_grants_xp_and_gold_once(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Ship RuneDay vertical slice',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);

        $this->actingAs($user)->post("/tasks/{$task->id}/complete")->assertRedirect();

        $profile = CharacterProfile::where('user_id', $user->id)->firstOrFail();
        $this->assertSame(60, $profile->total_xp);
        $this->assertSame(20, $profile->gold);
        $this->assertDatabaseCount(RewardTransaction::class, 1);

        $this->actingAs($user)->post("/tasks/{$task->id}/complete");
        $this->assertDatabaseCount(RewardTransaction::class, 1);
    }
}
