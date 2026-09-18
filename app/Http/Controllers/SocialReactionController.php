<?php

namespace App\Http\Controllers;

use App\Domain\Social\Enums\ReactionType;
use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Services\SocialReactionService;
use App\Http\Requests\Social\ReactSocialActivityRequest;
use Illuminate\Http\RedirectResponse;

class SocialReactionController extends Controller
{
    public function store(
        ReactSocialActivityRequest $request,
        SocialActivity $activity,
        SocialReactionService $reactions,
    ): RedirectResponse {
        $reactions->toggle(
            $request->user(),
            $activity,
            ReactionType::from($request->validated('type')),
        );

        return back();
    }
}
