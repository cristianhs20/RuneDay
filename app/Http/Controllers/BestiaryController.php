<?php

namespace App\Http\Controllers;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Domain\Adventure\Models\Encounter;
use App\Domain\Adventure\Models\Enemy;
use App\Domain\Adventure\Models\Region;
use App\Domain\Adventure\Services\WorldAccessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BestiaryController extends Controller
{
    public function __invoke(
        Request $request,
        WorldAccessService $access,
    ): Response {
        $user = $request->user();

        $encounters = Encounter::query()
            ->where('user_id', $user->id)
            ->get();

        $regions = Region::query()
            ->with([
                'enemies' => fn ($query) => $query->orderBy('sort_order'),
            ])
            ->orderBy('sort_order')
            ->get();

        $regionRows = [];

        foreach ($regions as $region) {
            $enemyRows = [];

            foreach ($region->enemies as $enemy) {
                /** @var Enemy $enemy */
                $history = $encounters->filter(
                    fn (Encounter $encounter) => $encounter->enemy_id === $enemy->id,
                );
                $wins = $history->filter(
                    fn (Encounter $encounter) => $encounter->status === EncounterStatus::Victory,
                )->count();
                $discovered = $history->isNotEmpty();

                $enemyRows[] = [
                    'slug' => $enemy->slug,
                    'name' => $discovered
                        ? $enemy->name
                        : 'Unknown creature',
                    'description' => $discovered
                        ? $enemy->description
                        : 'Start an encounter to reveal this entry.',
                    'type' => $enemy->type->value,
                    'visual_key' => $enemy->visual_key,
                    'discovered' => $discovered,
                    'wins' => $wins,
                    'max_hp' => $discovered ? $enemy->max_hp : null,
                    'attack' => $discovered ? $enemy->attack : null,
                    'defense' => $discovered ? $enemy->defense : null,
                ];
            }

            $regionRows[] = [
                'slug' => $region->slug,
                'name' => $region->name,
                'unlocked' => $access->regionUnlocked($user, $region),
                'enemies' => $enemyRows,
            ];
        }

        return Inertia::render('adventure/bestiary', [
            'regions' => $regionRows,
        ]);
    }
}
