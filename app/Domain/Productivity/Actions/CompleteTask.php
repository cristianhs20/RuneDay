<?php

namespace App\Domain\Productivity\Actions;

use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Game\Services\RewardEngine;
use App\Domain\Productivity\Models\Task;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteTask
{
    public function __construct(private readonly RewardEngine $rewards) {}

    /** @return array{granted: bool, xp: int, gold: int} */
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
            $rewardedToday = RewardTransaction::query()
                ->where('user_id', $task->user_id)
                ->where('source_type', 'task_completion')
                ->whereDate('created_at', today())
                ->count();

            $factor = match (true) {
                $rewardedToday < 12 => 1.0,
                $rewardedToday < 20 => 0.5,
                default => 0.0,
            };

            return $this->rewards->grant(
                $task->user_id,
                'task_completion',
                $task->id,
                (int) floor($baseXp * $factor),
                (int) floor($baseGold * $factor),
                [
                    'difficulty' => $task->difficulty->value,
                    'base_xp' => $baseXp,
                    'base_gold' => $baseGold,
                    'reward_factor' => $factor,
                ],
            );
        });
    }
}
