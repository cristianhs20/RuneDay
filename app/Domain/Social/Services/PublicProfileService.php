<?php

namespace App\Domain\Social\Services;

use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Game\Models\AchievementUnlock;
use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Models\SocialProfile;
use App\Models\User;

class PublicProfileService
{
    public function __construct(
        private readonly SocialPrivacyService $privacy,
        private readonly RelationshipService $relationships,
        private readonly CharacterSnapshot $characters,
        private readonly SocialFeedService $feed,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function for(SocialProfile $profile, ?User $viewer): array
    {
        if (! $this->privacy->canViewProfile($viewer, $profile)) {
            abort(404);
        }

        $target = $profile->user()->firstOrFail();
        $character = $this->characters->for($target);
        $adventure = AdventureProfile::firstOrNew([
            'user_id' => $target->id,
        ]);

        $achievements = [];

        if ($profile->show_achievements) {
            $unlocks = AchievementUnlock::query()
                ->where('user_id', $target->id)
                ->with('achievement')
                ->latest('unlocked_at')
                ->limit(12)
                ->get();

            foreach ($unlocks as $unlock) {
                $achievements[] = [
                    'slug' => $unlock->achievement->slug,
                    'name' => $unlock->achievement->name,
                    'description' => $unlock->achievement->description,
                    'icon' => $unlock->achievement->icon,
                    'unlocked_at' => $unlock->unlocked_at->toISOString(),
                ];
            }
        }

        $activities = SocialActivity::query()
            ->where('user_id', $target->id)
            ->with(['user', 'reactions'])
            ->latest()
            ->limit(20)
            ->get();

        $activityRows = [];

        foreach ($activities as $activity) {
            $row = $this->feed->serialize($viewer, $activity);

            if ($row) {
                $activityRows[] = $row;
            }

            if (count($activityRows) >= 8) {
                break;
            }
        }

        return [
            'profile' => [
                'handle' => $profile->handle,
                'bio' => $profile->bio,
                'profile_visibility' => $profile->profile_visibility->value,
                'friend_requests_enabled' => $profile->friend_requests_enabled,
                'friend_count' => count($this->relationships->friendIds($target)),
                'shareable' => $profile->profile_visibility->value === 'public',
            ],
            'relationship' => $this->relationships->relationshipState(
                $viewer,
                $target,
            ),
            'character' => [
                'created' => $character['created'],
                'name' => $character['name'],
                'archetype' => $character['archetype'],
                'appearance' => $character['appearance'],
                'level' => $character['level'],
                'equipment' => $character['equipment'],
                'stats' => $profile->show_stats
                    ? $character['stats']
                    : null,
            ],
            'adventure' => $profile->show_adventure
                ? [
                    'renown' => $adventure->renown,
                    'victories' => $adventure->victories,
                    'boss_victories' => $adventure->boss_victories,
                    'total_damage' => $adventure->total_damage,
                ]
                : null,
            'achievements' => $achievements,
            'recent_activity' => $activityRows,
        ];
    }
}
