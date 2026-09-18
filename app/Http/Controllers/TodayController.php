<?php

namespace App\Http\Controllers;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Productivity\Models\Daily;
use App\Domain\Productivity\Models\FocusSession;
use App\Domain\Productivity\Models\HabitLog;
use App\Domain\Productivity\Models\Task;
use App\Support\UserTime;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TodayController extends Controller
{
    public function __invoke(Request $request, UserTime $time): Response
    {
        $user = $request->user();
        $userId = $user->id;
        $profile = CharacterProfile::firstOrCreate(['user_id' => $userId]);
        $today = $time->today($user);
        $localDate = $today->toDateString();
        [$dayStart, $dayEnd] = $time->dayBoundsUtc($user, $today);

        $tasks = Task::query()
            ->where('user_id', $userId)
            ->whereNull('parent_id')
            ->whereNull('completed_at')
            ->whereNotNull('due_at')
            ->where('due_at', '<=', $dayEnd)
            ->withCount(['subtasks as open_subtasks_count' => fn ($query) => $query->whereNull('completed_at')])
            ->with('project:id,title')
            ->orderByRaw('due_at is null, due_at')
            ->orderByDesc('priority')
            ->latest()
            ->get([
                'id', 'project_id', 'title', 'notes', 'difficulty', 'priority',
                'due_at', 'estimate_minutes', 'completed_at',
            ]);

        $dailies = Daily::query()
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->with(['completions' => fn ($query) => $query->whereDate('completed_on', $localDate)])
            ->get()
            ->filter(fn (Daily $daily) => $daily->isDueOn($today))
            ->values()
            ->map(fn (Daily $daily) => [
                'id' => $daily->id,
                'title' => $daily->title,
                'difficulty' => $daily->difficulty->value,
                'completed_today' => $daily->completions->isNotEmpty(),
            ]);

        return Inertia::render('today', [
            'profile' => $profile->only(['level', 'xp', 'gold', 'total_xp']),
            'tasks' => $tasks,
            'dailies' => $dailies,
            'stats' => [
                'completed_today' => Task::query()
                    ->where('user_id', $userId)
                    ->whereBetween('completed_at', [$dayStart, $dayEnd])
                    ->count(),
                'focus_minutes_today' => FocusSession::query()
                    ->where('user_id', $userId)
                    ->whereBetween('completed_at', [$dayStart, $dayEnd])
                    ->sum('duration_minutes'),
                'habit_logs_today' => HabitLog::query()
                    ->where('user_id', $userId)
                    ->whereDate('logged_on', $localDate)
                    ->count(),
            ],
            'localDate' => $localDate,
            'timezone' => $user->timezone,
        ]);
    }
}
