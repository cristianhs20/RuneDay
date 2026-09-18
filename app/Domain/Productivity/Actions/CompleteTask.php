<?php

namespace App\Domain\Productivity\Actions;

use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Game\Services\QuestCompletionGameService;
use App\Domain\Productivity\Models\Task;
use App\Support\UserTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteTask
{
    public function __construct(
        private readonly QuestCompletionGameService $game,
        private readonly UserTime $time,
    ) {}

    /**
     * @return array{
     *     granted: bool,
     *     xp: int,
     *     gold: int,
     *     loot: array<string, mixed>|null,
     *     achievements: array<int, array<string, mixed>>
     * }
     */
    public function handle(Task $task): array
    {
        return DB::transaction(function () use ($task) {
            $task = Task::query()->lockForUpdate()->findOrFail($task->id);

            if ($task->completed_at) {
                throw ValidationException::withMessages(['task' => 'This quest is already complete.']);
            }

            if ($task->subtasks()->whereNull('completed_at')->exists()) {
                throw ValidationException::withMessages([
                    'task' => 'Complete the open subtasks before finishing this quest.',
                ]);
            }

            $task->update(['status' => 'completed', 'completed_at' => now()]);

            $baseXp = $task->difficulty->xp();
            $baseGold = $task->difficulty->gold();
            $user = $task->user()->firstOrFail();
            [$dayStart, $dayEnd] = $this->time->dayBoundsUtc($user);

            $rewardedToday = RewardTransaction::query()
                ->where('user_id', $task->user_id)
                ->where('source_type', 'task_completion')
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->count();

            $factor = match (true) {
                $rewardedToday < 12 => 1.0,
                $rewardedToday < 20 => 0.5,
                default => 0.0,
            };

            return $this->game->handle(
                $task,
                (int) floor($baseXp * $factor),
                (int) floor($baseGold * $factor),
                $factor,
                [
                    'difficulty' => $task->difficulty->value,
                    'base_xp' => $baseXp,
                    'base_gold' => $baseGold,
                    'reward_factor' => $factor,
                    'local_date' => $this->time->today($user)->toDateString(),
                ],
            );
        });
    }
}
