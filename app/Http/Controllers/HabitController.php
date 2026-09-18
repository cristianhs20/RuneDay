<?php

namespace App\Http\Controllers;

use App\Domain\Game\Services\AchievementEngine;
use App\Domain\Productivity\Actions\LogHabit;
use App\Domain\Productivity\Models\Habit;
use App\Http\Requests\Habits\LogHabitRequest;
use App\Http\Requests\Habits\StoreHabitRequest;
use App\Support\UserTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HabitController extends Controller
{
    public function index(Request $request, UserTime $time): Response
    {
        $today = $time->today($request->user());
        $localDate = $today->toDateString();
        $weekStart = $today->copy()->subDays(6)->toDateString();

        $habits = Habit::query()
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->with(['logs' => fn ($query) => $query->whereDate('logged_on', '>=', $weekStart)])
            ->orderBy('title')
            ->get()
            ->map(function (Habit $habit) use ($localDate) {
                $todayLogs = $habit->logs->filter(
                    fn ($log) => $log->logged_on->toDateString() === $localDate,
                );

                return [
                    'id' => $habit->id,
                    'title' => $habit->title,
                    'notes' => $habit->notes,
                    'mode' => $habit->mode,
                    'difficulty' => $habit->difficulty->value,
                    'today' => [
                        'positive' => $todayLogs->where('direction', 'positive')->count(),
                        'negative' => $todayLogs->where('direction', 'negative')->count(),
                        'neutral' => $todayLogs->where('direction', 'neutral')->count(),
                    ],
                    'last_7_days' => $habit->logs->count(),
                ];
            });

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

    public function log(
        LogHabitRequest $request,
        Habit $habit,
        LogHabit $logHabit,
        AchievementEngine $achievements,
    ): RedirectResponse {
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

        $unlocked = $achievements->evaluate($request->user());

        return back()
            ->with('reward', ['xp' => $reward['xp'], 'gold' => $reward['gold']])
            ->with('game_event', [
                'type' => 'habit_logged',
                'xp' => $reward['xp'],
                'gold' => $reward['gold'],
                'achievements' => $unlocked,
            ]);
    }

    private function authorizeHabit(Request $request, Habit $habit): void
    {
        abort_unless($habit->user_id === $request->user()->id, 403);
    }
}
