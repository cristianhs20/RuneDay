<?php

namespace App\Domain\Productivity\Actions;

use App\Domain\Game\Services\RewardEngine;
use App\Domain\Productivity\Models\Daily;
use App\Domain\Productivity\Models\DailyCompletion;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteDaily
{
    public function __construct(private readonly RewardEngine $rewards) {}

    /** @return array{granted: bool, xp: int, gold: int} */
    public function handle(Daily $daily): array
    {
        return DB::transaction(function () use ($daily) {
            $daily = Daily::query()->lockForUpdate()->findOrFail($daily->id);
            $date = today();

            if (! $daily->isDueOn($date)) {
                throw ValidationException::withMessages(['daily' => 'This daily is not due today.']);
            }

            $existing = DailyCompletion::query()
                ->where('daily_id', $daily->id)
                ->whereDate('completed_on', $date)
                ->first();

            if ($existing) {
                throw ValidationException::withMessages(['daily' => 'This daily is already complete today.']);
            }

            $completion = DailyCompletion::create([
                'daily_id' => $daily->id,
                'user_id' => $daily->user_id,
                'completed_on' => $date,
                'completed_at' => now(),
            ]);

            return $this->rewards->grant(
                $daily->user_id,
                'daily_completion',
                $completion->id,
                $daily->difficulty->xp(),
                $daily->difficulty->gold(),
                ['daily_id' => $daily->id, 'difficulty' => $daily->difficulty->value],
            );
        });
    }
}
