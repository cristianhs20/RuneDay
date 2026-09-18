<?php

namespace App\Http\Controllers;

use App\Domain\Social\Models\SocialProfile;
use App\Domain\Social\Services\PublicProfileService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicSocialProfileController extends Controller
{
    public function __invoke(
        Request $request,
        SocialProfile $profile,
        PublicProfileService $profiles,
    ): Response {
        return Inertia::render('social/public-profile', $profiles->for(
            $profile,
            $request->user(),
        ));
    }
}
