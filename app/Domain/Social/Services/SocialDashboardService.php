<?php

namespace App\Domain\Social\Services;

use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Social\Enums\FriendRequestStatus;
use App\Domain\Social\Models\FriendRequest;
use App\Domain\Social\Models\SocialBlock;
use App\Models\User;

class SocialDashboardService
{
    public function __construct(
        private readonly SocialProfileService $profiles,
        private readonly RelationshipService $relationships,
        private readonly CharacterSnapshot $characters,
        private readonly SocialFeedService $feed,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $profile = $this->profiles->for($user);
        $friendIds = $this->relationships->friendIds($user);

        $friends = User::query()
            ->whereIn('id', $friendIds)
            ->orderBy('name')
            ->get();

        $friendRows = [];

        foreach ($friends as $friend) {
            $friendRows[] = $this->personRow($friend);
        }

        $incoming = FriendRequest::query()
            ->where('receiver_id', $user->id)
            ->where('status', FriendRequestStatus::Pending->value)
            ->with('sender')
            ->latest()
            ->get();

        $incomingRows = [];

        foreach ($incoming as $request) {
            $incomingRows[] = [
                'id' => $request->id,
                'person' => $this->personRow(
                    $request->sender()->firstOrFail(),
                ),
            ];
        }

        $outgoing = FriendRequest::query()
            ->where('sender_id', $user->id)
            ->where('status', FriendRequestStatus::Pending->value)
            ->with('receiver')
            ->latest()
            ->get();

        $outgoingRows = [];

        foreach ($outgoing as $request) {
            $outgoingRows[] = [
                'id' => $request->id,
                'person' => $this->personRow(
                    $request->receiver()->firstOrFail(),
                ),
            ];
        }

        $blocks = SocialBlock::query()
            ->where('blocker_id', $user->id)
            ->with('blocked')
            ->latest()
            ->get();

        $blockedRows = [];

        foreach ($blocks as $block) {
            $blockedRows[] = $this->personRow(
                $block->blocked()->firstOrFail(),
            );
        }

        $leaderboard = array_merge(
            [$this->personRow($user)],
            $friendRows,
        );

        usort(
            $leaderboard,
            fn (array $left, array $right) => $right['level'] <=> $left['level']
                ?: strcmp((string) $left['handle'], (string) $right['handle']),
        );

        return [
            'profile' => [
                'handle' => $profile->handle,
                'friend_code' => $profile->friend_code,
                'bio' => $profile->bio,
                'profile_visibility' => $profile->profile_visibility->value,
                'activity_visibility' => $profile->activity_visibility->value,
                'friend_requests_enabled' => $profile->friend_requests_enabled,
                'show_adventure' => $profile->show_adventure,
                'show_stats' => $profile->show_stats,
                'show_achievements' => $profile->show_achievements,
            ],
            'friends' => $friendRows,
            'incoming_requests' => $incomingRows,
            'outgoing_requests' => $outgoingRows,
            'blocked' => $blockedRows,
            'leaderboard' => $leaderboard,
            'feed' => $this->feed->for($user),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function personRow(User $user): array
    {
        $profile = $this->profiles->for($user);
        $character = $this->characters->for($user);
        $adventure = AdventureProfile::firstOrNew([
            'user_id' => $user->id,
        ]);

        return [
            'handle' => $profile->handle,
            'name' => $character['name'],
            'level' => $character['level'],
            'archetype' => $character['archetype'],
            'appearance' => $character['appearance'],
            'equipment' => $character['equipment'],
            'renown' => $profile->show_adventure
                ? $adventure->renown
                : null,
            'boss_victories' => $profile->show_adventure
                ? $adventure->boss_victories
                : null,
        ];
    }
}
