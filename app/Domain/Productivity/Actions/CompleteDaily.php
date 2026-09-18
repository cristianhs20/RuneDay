<?php

namespace App\Domain\Productivity\Actions;

use App\Domain\Game\Services\RewardEngine;
use App\Domain\Productivity\Models\Daily;
use App\Domain\Productivity\Models\DailyCompletion;
use App\Support\UserTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompleteDaily
{
    public function __construct(
        private readonly RewardEngine $rewards,
        private readonly UserTime $time,
    ) {}

    /** @return array{granted: bool, xp: int, gold: int} */
    public function handle(Daily $daily): array
    {
        return DB::transaction(function () use ($daily) {
            $daily = Daily::query()->lockForUpdate()->findOrFail($daily->id);
            $user = $daily->user()->firstOrFail();
            $date = $this->time->today($user);
            $localDate = $date->toDateString();

            if (! $daily->isDueOn($date)) {
                throw ValidationException::withMessages(['daily' => 'This daily is not due today.']);
            }

            $existing = DailyCompletion::query()
                ->where('daily_id', $daily->id)
                ->whereDate('completed_on', $localDate)
                ->first();

            if ($existing) {
                throw ValidationException::withMessages(['daily' => 'This daily is already complete today.']);
            }

            $completion = DailyCompletion::create([
                'daily_id' => $daily->id,
                'user_id' => $daily->user_id,
                'completed_on' => $localDate,
                'completed_at' => now(),
            ]);

            return $this->rewards->grant(
                $daily->user_id,
                'daily_completion',
                $completion->id,
                $daily->difficulty->xp(),
                $daily->difficulty->gold(),
                [
                    'daily_id' => $daily->id,
                    'difficulty' => $daily->difficulty->value,
                    'local_date' => $localDate,
                ],
            );
        });
    }
}
