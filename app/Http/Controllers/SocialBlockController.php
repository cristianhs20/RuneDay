<?php

namespace App\Http\Controllers;

use App\Domain\Social\Models\SocialProfile;
use App\Domain\Social\Services\RelationshipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SocialBlockController extends Controller
{
    public function store(
        Request $request,
        SocialProfile $profile,
        RelationshipService $relationships,
    ): RedirectResponse {
        $relationships->block(
            $request->user(),
            $profile->user()->firstOrFail(),
        );

        return redirect()->route('social.index')
            ->with('success', 'Hero blocked.');
    }

    public function destroy(
        Request $request,
        SocialProfile $profile,
        RelationshipService $relationships,
    ): RedirectResponse {
        $relationships->unblock(
            $request->user(),
            $profile->user()->firstOrFail(),
        );

        return back()->with('success', 'Hero unblocked.');
    }
}
