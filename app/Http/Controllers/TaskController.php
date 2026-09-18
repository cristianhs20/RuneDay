<?php

namespace App\Http\Controllers;

use App\Domain\Productivity\Actions\CompleteTask;
use App\Domain\Productivity\Models\Project;
use App\Domain\Productivity\Models\Task;
use App\Http\Requests\Tasks\StoreTaskRequest;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $tasks = Task::query()
            ->where('user_id', $userId)
            ->whereNull('parent_id')
            ->where('status', '!=', 'archived')
            ->with([
                'project:id,title',
                'subtasks' => fn ($query) => $query->select(
                    'id', 'user_id', 'parent_id', 'project_id', 'title', 'status',
                    'difficulty', 'priority', 'due_at', 'estimate_minutes', 'completed_at'
                ),
            ])
            ->orderByRaw("case when status = 'pending' then 0 else 1 end")
            ->orderByRaw('due_at is null, due_at')
            ->latest()
            ->get();

        return Inertia::render('quests', [
            'tasks' => $tasks,
            'projects' => $this->projects($userId),
        ]);
    }

    public function inbox(Request $request): Response
    {
        $userId = $request->user()->id;
        $tasks = Task::query()
            ->where('user_id', $userId)
            ->whereNull('parent_id')
            ->whereNull('project_id')
            ->whereNull('due_at')
            ->whereNull('completed_at')
            ->latest()
            ->get();

        return Inertia::render('inbox', [
            'tasks' => $tasks,
            'projects' => $this->projects($userId),
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (! empty($data['parent_id']) && empty($data['project_id'])) {
            $parent = Task::query()
                ->where('user_id', $request->user()->id)
                ->findOrFail((int) $data['parent_id']);
            $data['project_id'] = $parent->project_id;
        }

        Task::create($data + ['user_id' => $request->user()->id]);

        return back()->with('success', 'Quest added.');
    }

    public function update(StoreTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorizeTask($request, $task);
        $data = $request->validated();

        $newReminder = isset($data['remind_at'])
            ? Carbon::parse((string) $data['remind_at'])
            : null;
        $reminderChanged = $newReminder === null
            ? $task->remind_at !== null
            : $task->remind_at === null || ! $task->remind_at->equalTo($newReminder);

        if ($reminderChanged) {
            $data['reminder_sent_at'] = null;
        }

        if (isset($data['parent_id']) && (int) $data['parent_id'] === $task->id) {
            return back()->withErrors(['parent_id' => 'A quest cannot be its own subtask.']);
        }

        $task->update($data);

        return back()->with('success', 'Quest updated.');
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTask($request, $task);

        if ($task->completed_at) {
            $task->update(['status' => 'archived']);
        } else {
            $task->delete();
        }

        return back()->with('success', 'Quest removed.');
    }

    public function complete(Request $request, Task $task, CompleteTask $completeTask): RedirectResponse
    {
        $this->authorizeTask($request, $task);
        $reward = $completeTask->handle($task);

        return back()->with('reward', ['xp' => $reward['xp'], 'gold' => $reward['gold']]);
    }

    private function authorizeTask(Request $request, Task $task): void
    {
        abort_unless($task->user_id === $request->user()->id, 403);
    }

    /** @return Collection<int, Project> */
    private function projects(int $userId): Collection
    {
        return Project::query()
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->withCount(['tasks as open_tasks_count' => fn ($query) => $query->whereNull('completed_at')])
            ->orderBy('title')
            ->get(['id', 'title', 'description', 'status', 'due_at']);
    }
}
