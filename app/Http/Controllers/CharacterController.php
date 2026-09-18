<?php

namespace App\Http\Controllers;

use App\Domain\Game\Services\CharacterCreationService;
use App\Domain\Game\Services\CharacterSnapshot;
use App\Http\Requests\Game\UpdateCharacterRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CharacterController extends Controller
{
    public function show(Request $request, CharacterSnapshot $snapshot): Response
    {
        return Inertia::render('game/character', [
            'character' => $snapshot->for($request->user()),
        ]);
    }

    public function update(
        UpdateCharacterRequest $request,
        CharacterCreationService $characters,
    ): RedirectResponse {
        $data = $request->validated();

        $characters->save(
            $request->user(),
            $data['character_name'],
            $data['archetype'],
            $data['lineage'],
            $data['appearance'],
        );

        return back()->with('success', 'Hero updated.');
    }
}
