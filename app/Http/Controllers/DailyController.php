<?php

namespace App\Http\Controllers;

use App\Domain\Productivity\Actions\CompleteDaily;
use App\Domain\Productivity\Models\Daily;
use App\Http\Requests\Dailies\StoreDailyRequest;
use App\Support\UserTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DailyController extends Controller
{
    public function index(Request $request, UserTime $time): Response
    {
        $today = $time->today($request->user());
        $localDate = $today->toDateString();

        $dailies = Daily::query()
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->with(['completions' => fn ($query) => $query->whereDate('completed_on', $localDate)])
            ->orderBy('title')
            ->get()
            ->map(fn (Daily $daily) => [
                'id' => $daily->id,
                'title' => $daily->title,
                'notes' => $daily->notes,
                'difficulty' => $daily->difficulty->value,
                'frequency' => $daily->frequency,
                'days_of_week' => $daily->days_of_week,
                'starts_on' => optional($daily->starts_on)->toDateString(),
                'ends_on' => optional($daily->ends_on)->toDateString(),
                'due_today' => $daily->isDueOn($today),
                'completed_today' => $daily->completions->isNotEmpty(),
            ]);

        return Inertia::render('dailies', ['dailies' => $dailies]);
    }

    public function store(StoreDailyRequest $request): RedirectResponse
    {
        Daily::create($request->validated() + ['user_id' => $request->user()->id]);

        return back()->with('success', 'Daily created.');
    }

    public function update(StoreDailyRequest $request, Daily $daily): RedirectResponse
    {
        $this->authorizeDaily($request, $daily);
        $daily->update($request->validated());

        return back()->with('success', 'Daily updated.');
    }

    public function destroy(Request $request, Daily $daily): RedirectResponse
    {
        $this->authorizeDaily($request, $daily);
        $daily->update(['is_active' => false]);

        return back()->with('success', 'Daily archived.');
    }

    public function complete(Request $request, Daily $daily, CompleteDaily $completeDaily): RedirectResponse
    {
        $this->authorizeDaily($request, $daily);
        $reward = $completeDaily->handle($daily);

        return back()->with('reward', ['xp' => $reward['xp'], 'gold' => $reward['gold']]);
    }

    private function authorizeDaily(Request $request, Daily $daily): void
    {
        abort_unless($daily->user_id === $request->user()->id, 403);
    }
}
