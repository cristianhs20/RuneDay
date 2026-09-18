<?php

namespace App\Domain\Social\Services;

use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Social\Models\SocialActivity;
use App\Domain\Social\Models\SocialReaction;
use App\Models\User;

class SocialFeedService
{
    public function __construct(
        private readonly RelationshipService $relationships,
        private readonly SocialProfileService $profiles,
        private readonly SocialPrivacyService $privacy,
        private readonly CharacterSnapshot $characters,
    ) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function for(User $user, int $limit = 40): array
    {
        $friendIds = $this->relationships->friendIds($user);

        $activities = SocialActivity::query()
            ->with(['user', 'reactions'])
            ->where(function ($query) use ($user, $friendIds) {
                $query->where('user_id', $user->id);

                if ($friendIds !== []) {
                    $query->orWhere(function ($friendQuery) use ($friendIds) {
                        $friendQuery
                            ->whereIn('user_id', $friendIds)
                            ->whereIn('visibility', ['friends', 'public']);
                    });
                }
            })
            ->latest()
            ->limit($limit)
            ->get();

        $rows = [];

        foreach ($activities as $activity) {
            $serialized = $this->serialize($user, $activity);

            if ($serialized) {
                $rows[] = $serialized;
            }
        }

        return $rows;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function serialize(?User $viewer, SocialActivity $activity): ?array
    {
        if (! $this->privacy->canViewActivity($viewer, $activity)) {
            return null;
        }

        $actor = $activity->relationLoaded('user')
            ? $activity->user
            : $activity->user()->firstOrFail();
        $profile = $this->profiles->for($actor);
        $character = $this->characters->for($actor);

        $counts = [
            'cheer' => 0,
            'fire' => 0,
            'sword' => 0,
            'crown' => 0,
        ];

        $viewerReaction = null;
        $reactions = $activity->relationLoaded('reactions')
            ? $activity->reactions
            : $activity->reactions()->get();

        foreach ($reactions as $reaction) {
            /** @var SocialReaction $reaction */
            $counts[$reaction->type->value]++;

            if ($viewer && $reaction->user_id === $viewer->id) {
                $viewerReaction = $reaction->type->value;
            }
        }

        return [
            'id' => $activity->id,
            'type' => $activity->type,
            'data' => $activity->data,
            'created_at' => $activity->created_at?->toISOString(),
            'actor' => [
                'handle' => $profile->handle,
                'name' => $character['name'],
                'level' => $character['level'],
                'archetype' => $character['archetype'],
                'appearance' => $character['appearance'],
                'equipment' => $character['equipment'],
            ],
            'reactions' => $counts,
            'viewer_reaction' => $viewerReaction,
            'can_react' => $viewer !== null
                && $viewer->id !== $activity->user_id,
        ];
    }
}
