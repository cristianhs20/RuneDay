<?php

namespace App\Http\Controllers;

use App\Domain\Productivity\Actions\LogHabit;
use App\Domain\Productivity\Models\Habit;
use App\Http\Requests\Habits\LogHabitRequest;
use App\Http\Requests\Habits\StoreHabitRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HabitController extends Controller
{
    public function index(Request $request): Response
    {
        $today = today();
        $weekStart = now()->startOfDay()->subDays(6);

        $habits = Habit::query()
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->with(['logs' => fn ($query) => $query->where('logged_at', '>=', $weekStart)])
            ->orderBy('title')
            ->get()
            ->map(fn (Habit $habit) => [
                'id' => $habit->id,
                'title' => $habit->title,
                'notes' => $habit->notes,
                'mode' => $habit->mode,
                'difficulty' => $habit->difficulty->value,
                'today' => [
                    'positive' => $habit->logs->where('logged_on', $today)->where('direction', 'positive')->count(),
                    'negative' => $habit->logs->where('logged_on', $today)->where('direction', 'negative')->count(),
                    'neutral' => $habit->logs->where('logged_on', $today)->where('direction', 'neutral')->count(),
                ],
                'last_7_days' => $habit->logs->count(),
            ]);

        return Inertia::render('habits', ['habits' => $habits]);
    }

    public function store(StoreHabitRequest $request): RedirectResponse
    {
        Habit::create($request->validated() + ['user_id' => $request->user()->id]);

        return back()->with('success', 'Habit created.');
    }

    public function update(StoreHabitRequest $request, Habit $habit): RedirectResponse
    {
        $this->authorizeHabit($request, $habit);
        $habit->update($request->validated());

        return back()->with('success', 'Habit updated.');
    }

    public function destroy(Request $request, Habit $habit): RedirectResponse
    {
        $this->authorizeHabit($request, $habit);
        $habit->update(['is_active' => false]);

        return back()->with('success', 'Habit archived.');
    }

    public function log(LogHabitRequest $request, Habit $habit, LogHabit $logHabit): RedirectResponse
    {
        $this->authorizeHabit($request, $habit);
        $direction = $request->validated('direction');

        $allowed = match ($habit->mode) {
            'positive' => ['positive'],
            'negative' => ['negative'],
            'neutral' => ['neutral'],
            default => ['positive', 'negative'],
        };

        abort_unless(in_array($direction, $allowed, true), 422);

        $reward = $logHabit->handle($habit, $direction, $request->validated('note'));

        return back()->with('reward', ['xp' => $reward['xp'], 'gold' => $reward['gold']]);
    }

    private function authorizeHabit(Request $request, Habit $habit): void
    {
        abort_unless($habit->user_id === $request->user()->id, 403);
    }
}
