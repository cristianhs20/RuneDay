<?php

namespace App\Domain\Social\Services;

use App\Domain\Social\Enums\SocialVisibility;
use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Models\SocialProfile;
use App\Models\User;

class SocialPrivacyService
{
    public function __construct(private readonly RelationshipService $relationships) {}

    public function canViewProfile(?User $viewer, SocialProfile $profile): bool
    {
        $target = $profile->user()->firstOrFail();

        if ($viewer?->id === $target->id) {
            return true;
        }

        if ($viewer && $this->relationships->isBlockedBetween($viewer, $target)) {
            return false;
        }

        return match ($profile->profile_visibility) {
            SocialVisibility::Public => true,
            SocialVisibility::Friends => $viewer
                ? $this->relationships->areFriends($viewer, $target)
                : false,
            SocialVisibility::Private => false,
        };
    }

    public function canViewActivity(?User $viewer, SocialActivity $activity): bool
    {
        $actor = $activity->user()->firstOrFail();

        if ($viewer?->id === $actor->id) {
            return true;
        }

        if ($viewer && $this->relationships->isBlockedBetween($viewer, $actor)) {
            return false;
        }

        return match ($activity->visibility) {
            SocialVisibility::Public => true,
            SocialVisibility::Friends => $viewer
                ? $this->relationships->areFriends($viewer, $actor)
                : false,
            SocialVisibility::Private => false,
        };
    }
}
