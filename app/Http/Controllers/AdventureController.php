<?php

namespace App\Http\Controllers;

use App\Domain\Adventure\Services\WorldSnapshot;
use App\Domain\Game\Services\CharacterSnapshot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdventureController extends Controller
{
    public function __invoke(
        Request $request,
        WorldSnapshot $world,
        CharacterSnapshot $character,
    ): Response {
        return Inertia::render('adventure/world', [
            'world' => $world->for($request->user()),
            'character' => $character->for($request->user()),
        ]);
    }
}
