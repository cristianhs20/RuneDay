<?php

namespace App\Domain\Productivity\Actions;

use App\Domain\Game\Services\RewardEngine;
use App\Domain\Productivity\Models\FocusSession;
use Illuminate\Support\Facades\DB;

class RecordFocusSession
{
    public function __construct(private readonly RewardEngine $rewards) {}

    /**
     * @return array{granted: bool, xp: int, gold: int, session: FocusSession}
     */
    public function handle(int $userId, int $minutes, ?int $taskId = null, string $mode = 'focus'): array
    {
        return DB::transaction(function () use ($userId, $minutes, $taskId, $mode) {
            $completedAt = now();

            $session = FocusSession::create([
                'user_id' => $userId,
                'task_id' => $taskId,
                'duration_minutes' => $minutes,
                'started_at' => $completedAt->copy()->subMinutes($minutes),
                'completed_at' => $completedAt,
                'mode' => $mode,
            ]);

            $xp = min(60, intdiv($minutes, 5) * 3);
            $gold = min(6, intdiv($minutes, 25));

            $reward = $this->rewards->grant(
                $userId,
                'focus_session',
                $session->id,
                $xp,
                $gold,
                ['duration_minutes' => $minutes, 'task_id' => $taskId, 'mode' => $mode],
            );

            return $reward + ['session' => $session];
        });
    }
}
