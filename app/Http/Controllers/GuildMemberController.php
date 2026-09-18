<?php

namespace App\Http\Controllers;

use App\Domain\Guild\Enums\GuildRole;
use App\Domain\Guild\Models\GuildMember;
use App\Domain\Guild\Services\GuildMembershipService;
use App\Http\Requests\Guild\UpdateGuildRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GuildMemberController extends Controller
{
    public function update(
        UpdateGuildRoleRequest $request,
        GuildMember $guildMember,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->setRole(
            $request->user(),
            $guildMember,
            GuildRole::from($request->validated('role')),
        );

        return back()->with('success', 'Guild role updated.');
    }

    public function transfer(
        Request $request,
        GuildMember $guildMember,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->transferLeadership(
            $request->user(),
            $guildMember,
        );

        return back()->with('success', 'Guild leadership transferred.');
    }

    public function destroy(
        Request $request,
        GuildMember $guildMember,
        GuildMembershipService $guilds,
    ): RedirectResponse {
        $guilds->removeMember(
            $request->user(),
            $guildMember,
        );

        return back()->with('success', 'Member removed from the guild.');
    }
}
