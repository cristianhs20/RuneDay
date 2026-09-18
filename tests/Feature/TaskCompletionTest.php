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

    public function test_completing_a_quest_grants_base_reward_once(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $task = Task::create([
            'user_id' => $user->id,
            'title' => 'Ship RuneDay vertical slice',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);

        $this->actingAs($user)->post("/tasks/{$task->id}/complete")->assertRedirect();

        $this->assertDatabaseHas('reward_transactions', [
            'user_id' => $user->id,
            'source_type' => 'task_completion',
            'source_id' => $task->id,
            'xp_delta' => 60,
            'gold_delta' => 20,
        ]);

        $this->assertSame(
            1,
            RewardTransaction::query()
                ->where('user_id', $user->id)
                ->where('source_type', 'task_completion')
                ->count(),
        );

        $profile = CharacterProfile::where('user_id', $user->id)->firstOrFail();
        $xpAfterFirst = $profile->total_xp;
        $goldAfterFirst = $profile->gold;

        $this->actingAs($user)->post("/tasks/{$task->id}/complete");

        $profile->refresh();
        $this->assertSame($xpAfterFirst, $profile->total_xp);
        $this->assertSame($goldAfterFirst, $profile->gold);
        $this->assertSame(
            1,
            RewardTransaction::query()
                ->where('user_id', $user->id)
                ->where('source_type', 'task_completion')
                ->count(),
        );
    }
}
