<?php

namespace App\Domain\Productivity\Actions;

use App\Domain\Game\Services\RewardEngine;
use App\Domain\Productivity\Models\Habit;
use App\Domain\Productivity\Models\HabitLog;
use Illuminate\Support\Facades\DB;

class LogHabit
{
    public function __construct(private readonly RewardEngine $rewards) {}

    /** @return array{granted: bool, xp: int, gold: int} */
    public function handle(Habit $habit, string $direction, ?string $note = null): array
    {
        return DB::transaction(function () use ($habit, $direction, $note) {
            $log = HabitLog::create([
                'habit_id' => $habit->id,
                'user_id' => $habit->user_id,
                'direction' => $direction,
                'logged_on' => today(),
                'logged_at' => now(),
                'note' => $note,
            ]);

            $firstPositiveToday = $direction === 'positive'
                && ! HabitLog::query()
                    ->where('habit_id', $habit->id)
                    ->whereDate('logged_on', today())
                    ->where('direction', 'positive')
                    ->where('id', '!=', $log->id)
                    ->exists();

            if (! $firstPositiveToday) {
                return ['granted' => false, 'xp' => 0, 'gold' => 0];
            }

            return $this->rewards->grant(
                $habit->user_id,
                'habit_positive_log',
                $log->id,
                max(5, intdiv($habit->difficulty->xp(), 2)),
                max(1, intdiv($habit->difficulty->gold(), 2)),
                ['habit_id' => $habit->id, 'difficulty' => $habit->difficulty->value],
            );
        });
    }
}
