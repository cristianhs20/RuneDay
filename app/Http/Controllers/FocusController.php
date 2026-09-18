<?php

namespace App\Http\Controllers;

use App\Domain\Game\Services\AchievementEngine;
use App\Domain\Productivity\Actions\RecordFocusSession;
use App\Domain\Productivity\Models\FocusSession;
use App\Domain\Productivity\Models\Task;
use App\Http\Requests\Focus\StoreFocusSessionRequest;
use App\Support\UserTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FocusController extends Controller
{
    public function index(Request $request, UserTime $time): Response
    {
        $user = $request->user();
        $userId = $user->id;
        [$dayStart, $dayEnd] = $time->dayBoundsUtc($user);
        $sessions = FocusSession::query()
            ->where('user_id', $userId)
            ->with('task:id,title')
            ->latest('completed_at')
            ->limit(12)
            ->get();

        $todayMinutes = FocusSession::query()
            ->where('user_id', $userId)
            ->whereBetween('completed_at', [$dayStart, $dayEnd])
            ->sum('duration_minutes');

        $tasks = Task::query()
            ->where('user_id', $userId)
            ->whereNull('completed_at')
            ->whereNull('parent_id')
            ->orderByRaw('due_at is null, due_at')
            ->limit(30)
            ->get(['id', 'title']);

        return Inertia::render('focus', [
            'sessions' => $sessions,
            'todayMinutes' => $todayMinutes,
            'tasks' => $tasks,
        ]);
    }

    public function store(
        StoreFocusSessionRequest $request,
        RecordFocusSession $record,
        AchievementEngine $achievements,
    ): RedirectResponse {
        $data = $request->validated();
        $reward = $record->handle(
            $request->user()->id,
            $data['duration_minutes'],
            $data['task_id'] ?? null,
            $data['mode'] ?? 'focus',
        );

        $unlocked = $achievements->evaluate($request->user());

        return back()
            ->with('reward', ['xp' => $reward['xp'], 'gold' => $reward['gold']])
            ->with('game_event', [
                'type' => 'focus_complete',
                'xp' => $reward['xp'],
                'gold' => $reward['gold'],
                'achievements' => $unlocked,
            ]);
    }
}
