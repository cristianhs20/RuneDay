<?php

namespace App\Http\Controllers;

use App\Domain\Productivity\Models\Daily;
use App\Domain\Productivity\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $month = $request->string('month')->toString();
        $cursor = preg_match('/^\d{4}-\d{2}$/', $month)
            ? Carbon::createFromFormat('Y-m', $month)->startOfMonth()
            : now()->startOfMonth();

        $start = $cursor->copy()->startOfMonth();
        $end = $cursor->copy()->endOfMonth();
        $userId = $request->user()->id;

        $tasks = Task::query()
            ->where('user_id', $userId)
            ->whereNotNull('due_at')
            ->whereBetween('due_at', [$start, $end])
            ->with('project:id,title')
            ->orderBy('due_at')
            ->get(['id', 'project_id', 'title', 'difficulty', 'due_at', 'completed_at']);

        $dailies = Daily::query()
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('title')
            ->get(['id', 'title', 'frequency', 'days_of_week', 'starts_on', 'ends_on']);

        return Inertia::render('calendar', [
            'month' => $cursor->format('Y-m'),
            'monthLabel' => $cursor->format('F Y'),
            'tasks' => $tasks,
            'dailies' => $dailies,
        ]);
    }
}
