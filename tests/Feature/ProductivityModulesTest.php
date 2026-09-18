<?php

namespace Tests\Feature;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Productivity\Models\Daily;
use App\Domain\Productivity\Models\Habit;
use App\Domain\Productivity\Models\HabitLog;
use App\Domain\Productivity\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductivityModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_cannot_modify_another_users_quest(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $intruder = User::factory()->create(['email_verified_at' => now()]);
        $task = Task::create([
            'user_id' => $owner->id,
            'title' => 'Private quest',
            'difficulty' => 'normal',
            'priority' => 2,
        ]);

        $this->actingAs($intruder)
            ->delete("/tasks/{$task->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_parent_quest_requires_open_subtasks_to_be_completed_first(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $parent = Task::create([
            'user_id' => $user->id,
            'title' => 'Launch campaign',
            'difficulty' => 'hard',
            'priority' => 3,
        ]);
        $child = Task::create([
            'user_id' => $user->id,
            'parent_id' => $parent->id,
            'title' => 'Final QA',
            'difficulty' => 'easy',
            'priority' => 1,
        ]);

        $this->actingAs($user)
            ->post("/tasks/{$parent->id}/complete")
            ->assertSessionHasErrors('task');

        $this->actingAs($user)->post("/tasks/{$child->id}/complete")->assertRedirect();
        $this->actingAs($user)->post("/tasks/{$parent->id}/complete")->assertRedirect();

        $this->assertNotNull($parent->fresh()->completed_at);
    }

    public function test_daily_can_reward_only_once_per_day(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $daily = Daily::create([
            'user_id' => $user->id,
            'title' => 'Read 20 minutes',
            'difficulty' => 'normal',
            'frequency' => 'daily',
            'is_active' => true,
        ]);

        $this->actingAs($user)->post("/dailies/{$daily->id}/complete")->assertRedirect();

        $this->assertDatabaseCount('daily_completions', 1);
        $this->assertDatabaseHas('reward_transactions', [
            'user_id' => $user->id,
            'source_type' => 'daily_completion',
            'xp_delta' => 30,
            'gold_delta' => 10,
        ]);

        $this->actingAs($user)
            ->post("/dailies/{$daily->id}/complete")
            ->assertSessionHasErrors('daily');

        $this->assertDatabaseCount('daily_completions', 1);
    }

    public function test_positive_habit_only_rewards_first_positive_log_of_the_day(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $habit = Habit::create([
            'user_id' => $user->id,
            'title' => 'Practice English',
            'mode' => 'positive',
            'difficulty' => 'normal',
            'is_active' => true,
        ]);

        $this->actingAs($user)->post("/habits/{$habit->id}/log", [
            'direction' => 'positive',
        ])->assertRedirect();

        $this->actingAs($user)->post("/habits/{$habit->id}/log", [
            'direction' => 'positive',
        ])->assertRedirect();

        $this->assertSame(2, HabitLog::where('habit_id', $habit->id)->count());
        $this->assertSame(
            1,
            RewardTransaction::where('source_type', 'habit_positive_log')->count(),
        );
    }

    public function test_completed_focus_session_is_recorded_and_rewards_progress(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->post('/focus-sessions', [
            'duration_minutes' => 25,
            'mode' => 'pomodoro',
        ])->assertRedirect();

        $this->assertDatabaseHas('focus_sessions', [
            'user_id' => $user->id,
            'duration_minutes' => 25,
            'mode' => 'pomodoro',
        ]);
        $this->assertDatabaseHas('reward_transactions', [
            'user_id' => $user->id,
            'source_type' => 'focus_session',
            'xp_delta' => 15,
            'gold_delta' => 1,
        ]);

        $profile = CharacterProfile::where('user_id', $user->id)->firstOrFail();
        $this->assertSame(15, $profile->total_xp);
        $this->assertSame(1, $profile->gold);
    }
}
