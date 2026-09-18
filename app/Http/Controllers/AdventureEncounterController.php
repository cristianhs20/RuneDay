<?php

namespace App\Http\Controllers;

use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Services\EncounterService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdventureEncounterController extends Controller
{
    public function store(
        Request $request,
        Enemy $enemy,
        EncounterService $encounters,
    ): RedirectResponse {
        $encounter = $encounters->start($request->user(), $enemy);

        return back()
            ->with('success', 'Encounter started.')
            ->with('game_event', [
                'type' => 'encounter_started',
                'combat' => [
                    'encounter_id' => $encounter->id,
                    'enemy' => [
                        'slug' => $encounter->enemy->slug,
                        'name' => $encounter->enemy->name,
                        'type' => $encounter->enemy->type->value,
                        'visual_key' => $encounter->enemy->visual_key,
                    ],
                    'enemy_hp_remaining' => $encounter->enemy_hp_remaining,
                    'enemy_max_hp' => $encounter->enemy->max_hp,
                    'hero_hp_remaining' => $encounter->hero_hp_remaining,
                    'hero_max_hp' => $encounter->hero_max_hp,
                    'damage' => 0,
                    'enemy_damage' => 0,
                    'critical' => false,
                    'rested' => false,
                    'victory' => false,
                    'capped' => false,
                    'rewards' => null,
                ],
            ]);
    }

    public function destroy(
        Request $request,
        Encounter $encounter,
        EncounterService $encounters,
    ): RedirectResponse {
        $encounters->abandon($request->user(), $encounter);

        return back()->with('success', 'Encounter abandoned. No progress was lost elsewhere.');
    }
}
