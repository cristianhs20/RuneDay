<?php

namespace App\Http\Controllers;

use App\Domain\Productivity\Actions\RecordFocusSession;
use App\Domain\Productivity\Models\FocusSession;
use App\Domain\Productivity\Models\Task;
use App\Http\Requests\Focus\StoreFocusSessionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FocusController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $sessions = FocusSession::query()
            ->where('user_id', $userId)
            ->with('task:id,title')
            ->latest('completed_at')
            ->limit(12)
            ->get();

        $todayMinutes = FocusSession::query()
            ->where('user_id', $userId)
            ->whereDate('completed_at', today())
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

    public function store(StoreFocusSessionRequest $request, RecordFocusSession $record): RedirectResponse
    {
        $data = $request->validated();
        $reward = $record->handle(
            $request->user()->id,
            $data['duration_minutes'],
            $data['task_id'] ?? null,
            $data['mode'] ?? 'focus',
        );

        return back()->with('reward', ['xp' => $reward['xp'], 'gold' => $reward['gold']]);
    }
}
