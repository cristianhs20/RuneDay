<?php

namespace App\Http\Controllers;

use App\Domain\Social\Models\FriendRequest;
use App\Domain\Social\Services\RelationshipService;
use App\Http\Requests\Social\SendFriendRequestRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FriendRequestController extends Controller
{
    public function store(
        SendFriendRequestRequest $request,
        RelationshipService $relationships,
    ): RedirectResponse {
        $relationships->sendRequest(
            $request->user(),
            $request->validated('identifier'),
        );

        return back()->with('success', 'Friend request sent.');
    }

    public function accept(
        Request $request,
        FriendRequest $friendRequest,
        RelationshipService $relationships,
    ): RedirectResponse {
        $relationships->accept($request->user(), $friendRequest);

        return back()->with('success', 'Friend added.');
    }

    public function decline(
        Request $request,
        FriendRequest $friendRequest,
        RelationshipService $relationships,
    ): RedirectResponse {
        $relationships->decline($request->user(), $friendRequest);

        return back()->with('success', 'Friend request declined.');
    }

    public function cancel(
        Request $request,
        FriendRequest $friendRequest,
        RelationshipService $relationships,
    ): RedirectResponse {
        $relationships->cancel($request->user(), $friendRequest);

        return back()->with('success', 'Friend request canceled.');
    }
}
