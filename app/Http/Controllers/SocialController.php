<?php

namespace App\Http\Controllers;

use App\Domain\Social\Services\SocialDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialController extends Controller
{
    public function __invoke(
        Request $request,
        SocialDashboardService $social,
    ): Response {
        return Inertia::render('social/index', $social->for($request->user()));
    }
}
