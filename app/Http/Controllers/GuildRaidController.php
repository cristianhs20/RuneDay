<?php

namespace App\Http\Controllers;

use App\Domain\Guild\Models\GuildRaid;
use App\Domain\Guild\Models\RaidBoss;
use App\Domain\Guild\Services\GuildRaidService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GuildRaidController extends Controller
{
    public function store(
        Request $request,
        RaidBoss $raidBoss,
        GuildRaidService $raids,
    ): RedirectResponse {
        $raid = $raids->start($request->user(), $raidBoss);

        return back()
            ->with('success', $raid->boss->name.' raid started.')
            ->with('game_event', [
                'type' => 'guild_raid_started',
                'guild' => [
                    'raid' => [
                        'raid_id' => $raid->id,
                        'damage' => 0,
                        'critical' => false,
                        'hp_remaining' => $raid->hp_remaining,
                        'max_hp' => $raid->boss->max_hp,
                        'victory' => false,
                        'capped' => false,
                        'boss' => [
                            'slug' => $raid->boss->slug,
                            'name' => $raid->boss->name,
                            'visual_key' => $raid->boss->visual_key,
                        ],
                        'settlement' => null,
                    ],
                ],
            ]);
    }

    public function destroy(
        Request $request,
        GuildRaid $guildRaid,
        GuildRaidService $raids,
    ): RedirectResponse {
        $raids->abandon($request->user(), $guildRaid);

        return back()->with('success', 'Raid abandoned.');
    }
}
