<?php

namespace App\Http\Controllers;

use App\Domain\Guild\Models\GuildInvite;
use App\Domain\Guild\Services\GuildMembershipService;
use App\Domain\Social\Models\SocialProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GuildInviteController extends Controller
{
    public function store(
        Request $request,
        SocialProfile $profile,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->invite($request->user(), $profile);

        return back()->with('success', 'Guild invitation sent.');
    }

    public function accept(
        Request $request,
        GuildInvite $guildInvite,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->accept($request->user(), $guildInvite);

        return redirect()
            ->route('guild.index')
            ->with('success', 'Welcome to the guild.');
    }

    public function decline(
        Request $request,
        GuildInvite $guildInvite,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->decline($request->user(), $guildInvite);

        return back()->with('success', 'Guild invitation declined.');
    }

    public function cancel(
        Request $request,
        GuildInvite $guildInvite,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->cancelInvite($request->user(), $guildInvite);

        return back()->with('success', 'Guild invitation canceled.');
    }
}
