<?php

namespace App\Support;

use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class UserTime
{
    public function now(User $user): Carbon
    {
        return Carbon::now('UTC')->setTimezone($user->timezone ?: 'UTC');
    }

    public function today(User $user): Carbon
    {
        return $this->now($user)->startOfDay();
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    public function dayBoundsUtc(User $user, ?CarbonInterface $localDay = null): array
    {
        $timezone = $user->timezone ?: 'UTC';
        $day = $localDay
            ? Carbon::instance($localDay)->setTimezone($timezone)
            : $this->now($user);

        return [
            $day->copy()->startOfDay()->utc(),
            $day->copy()->endOfDay()->utc(),
        ];
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    public function monthBoundsUtc(User $user, string $month): array
    {
        $timezone = $user->timezone ?: 'UTC';
        $cursor = Carbon::createFromFormat('Y-m', $month, $timezone)->startOfMonth();

        return [
            $cursor->copy()->startOfMonth()->utc(),
            $cursor->copy()->endOfMonth()->utc(),
        ];
    }
}
