<?php

namespace App\Http\Controllers;

use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Services\SocialDashboardService;
use App\Domain\Social\Services\SocialProfileService;
use App\Http\Requests\Social\UpdateSocialProfileRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialProfileSettingsController extends Controller
{
    public function show(
        Request $request,
        SocialDashboardService $social,
    ): Response {
        $dashboard = $social->for($request->user());

        return Inertia::render('social/settings', [
            'profile' => $dashboard['profile'],
            'blocked' => $dashboard['blocked'],
        ]);
    }

    public function update(
        UpdateSocialProfileRequest $request,
        SocialProfileService $profiles,
    ): RedirectResponse {
        $profile = $profiles->for($request->user());
        $data = $request->validated();
        $previousActivityVisibility = $profile->activity_visibility->value;

        $profile->update($data);

        if ($previousActivityVisibility !== $data['activity_visibility']) {
            SocialActivity::query()
                ->where('user_id', $request->user()->id)
                ->update(['visibility' => $data['activity_visibility']]);
        }

        return back()->with('success', 'Social profile updated.');
    }
}
