<?php

namespace App\Http\Controllers;

use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Productivity\Models\FocusSession;
use App\Domain\Productivity\Models\HabitLog;
use App\Domain\Productivity\Models\Task;
use App\Support\UserTime;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InsightsController extends Controller
{
    public function __invoke(Request $request, UserTime $time): Response
    {
        $user = $request->user();
        $timezone = $user->timezone ?: 'UTC';
        $today = $time->today($user);
        $firstDay = $today->copy()->subDays(6);
        [$rangeStart] = $time->dayBoundsUtc($user, $firstDay);
        [, $rangeEnd] = $time->dayBoundsUtc($user, $today);

        $tasks = Task::query()
            ->where('user_id', $user->id)
            ->whereBetween('completed_at', [$rangeStart, $rangeEnd])
            ->get(['completed_at']);

        $focusSessions = FocusSession::query()
            ->where('user_id', $user->id)
            ->whereBetween('completed_at', [$rangeStart, $rangeEnd])
            ->get(['duration_minutes', 'completed_at']);

        $habitLogs = HabitLog::query()
            ->where('user_id', $user->id)
            ->whereBetween('logged_on', [$firstDay->toDateString(), $today->toDateString()])
            ->get(['logged_on']);

        $rewards = RewardTransaction::query()
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->get(['xp_delta', 'gold_delta', 'created_at']);

        $days = collect(range(0, 6))->map(function (int $offset) use (
            $firstDay,
            $timezone,
            $tasks,
            $focusSessions,
            $habitLogs,
            $rewards,
        ) {
            $date = $firstDay->copy()->addDays($offset);
            $key = $date->toDateString();

            return [
                'date' => $key,
                'label' => $date->format('D'),
                'quests' => $tasks->filter(
                    fn (Task $task) => $task->completed_at?->setTimezone($timezone)->toDateString() === $key,
                )->count(),
                'focus_minutes' => $focusSessions->filter(
                    fn (FocusSession $session) => $session->completed_at->setTimezone($timezone)->toDateString() === $key,
                )->sum('duration_minutes'),
                'habit_logs' => $habitLogs->filter(
                    fn (HabitLog $log) => $log->logged_on->toDateString() === $key,
                )->count(),
                'xp' => $rewards->filter(
                    fn (RewardTransaction $reward) => $reward->created_at?->setTimezone($timezone)->toDateString() === $key,
                )->sum('xp_delta'),
            ];
        });

        return Inertia::render('insights', [
            'days' => $days,
            'totals' => [
                'quests' => $tasks->count(),
                'focus_minutes' => $focusSessions->sum('duration_minutes'),
                'habit_logs' => $habitLogs->count(),
                'xp' => $rewards->sum('xp_delta'),
                'gold' => $rewards->sum('gold_delta'),
            ],
            'timezone' => $timezone,
        ]);
    }
}
