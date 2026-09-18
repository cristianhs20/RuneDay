<?php

namespace App\Http\Controllers;

use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Services\GuildMembershipService;
use App\Domain\Guild\Services\GuildSnapshotService;
use App\Http\Requests\Guild\StoreGuildRequest;
use App\Http\Requests\Guild\UpdateGuildRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuildController extends Controller
{
    public function index(
        Request $request,
        GuildSnapshotService $guilds,
    ): Response {
        return Inertia::render('guild/index', $guilds->for($request->user()));
    }

    public function store(
        StoreGuildRequest $request,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $data = $request->validated();

        $guild = $guilds->createGuild(
            $request->user(),
            [
                'name' => (string) $data['name'],
                'tag' => (string) $data['tag'],
                'description' => isset($data['description'])
                    ? (string) $data['description']
                    : null,
            ],
        );

        return redirect()
            ->route('guild.index')
            ->with('success', '['.$guild->tag.'] '.$guild->name.' founded.');
    }

    public function update(
        UpdateGuildRequest $request,
        Guild $guild,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $data = $request->validated();

        $guilds->updateGuild(
            $request->user(),
            $guild,
            [
                'name' => (string) $data['name'],
                'tag' => (string) $data['tag'],
                'description' => isset($data['description'])
                    ? (string) $data['description']
                    : null,
            ],
        );

        return back()->with('success', 'Guild settings updated.');
    }

    public function leave(
        Request $request,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->leave($request->user());

        return redirect()
            ->route('guild.index')
            ->with('success', 'You left the guild.');
    }

    public function destroy(
        Request $request,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->disband($request->user());

        return redirect()
            ->route('guild.index')
            ->with('success', 'Guild disbanded.');
    }
}
