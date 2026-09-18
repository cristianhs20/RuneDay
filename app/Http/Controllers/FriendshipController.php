<?php

namespace App\Http\Controllers;

use App\Domain\Social\Models\SocialProfile;
use App\Domain\Social\Services\RelationshipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    public function destroy(
        Request $request,
        SocialProfile $profile,
        RelationshipService $relationships,
    ): RedirectResponse {
        $friend = $profile->user()->firstOrFail();

        $relationships->removeFriend($request->user(), $friend);

        return back()->with('success', 'Friend removed.');
    }
}
