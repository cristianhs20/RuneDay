<?php

namespace App\Http\Controllers;

use App\Domain\Productivity\Models\Project;
use App\Http\Requests\Projects\StoreProjectRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        Project::create($request->validated() + ['user_id' => $request->user()->id]);

        return back()->with('success', 'Campaign created.');
    }

    public function update(StoreProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorizeProject($request, $project);
        $project->update($request->validated());

        return back()->with('success', 'Campaign updated.');
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProject($request, $project);
        $project->update(['status' => 'archived']);

        return back()->with('success', 'Campaign archived.');
    }

    private function authorizeProject(Request $request, Project $project): void
    {
        abort_unless($project->user_id === $request->user()->id, 403);
    }
}
