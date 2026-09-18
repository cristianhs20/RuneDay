<?php

namespace App\Domain\Guild\Services;

use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Guild\Enums\GuildInviteStatus;
use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\GuildContribution;
use App\Domain\Guild\Models\GuildInvite;
use App\Domain\Guild\Models\GuildMember;
use App\Domain\Guild\Models\GuildRaidContribution;
use App\Domain\Guild\Models\RaidBoss;
use App\Domain\Social\Services\RelationshipService;
use App\Domain\Social\Services\SocialProfileService;
use App\Models\User;

class GuildSnapshotService
{
    public function __construct(
        private readonly GuildMembershipService $memberships,
        private readonly GuildHallService $hall,
        private readonly GuildRaidService $raids,
        private readonly RelationshipService $relationships,
        private readonly SocialProfileService $socialProfiles,
        private readonly CharacterSnapshot $characters,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function for(User $user): array
    {
        $membership = $this->memberships->membership($user);
        $incomingInvites = $this->incomingInvites($user);

        if (! $membership) {
            return [
                'membership' => null,
                'incoming_invites' => $incomingInvites,
                'guild' => null,
            ];
        }

        $guild = $membership->guild;
        $hall = $this->hall->for($guild);
        $members = GuildMember::query()
            ->where('guild_id', $guild->id)
            ->with('user')
            ->orderByRaw("case role when 'leader' then 1 when 'officer' then 2 else 3 end")
            ->orderByDesc('contribution_xp')
            ->get();

        $memberRows = [];

        foreach ($members as $member) {
            $memberUser = $member->user()->firstOrFail();
            $profile = $this->socialProfiles->for($memberUser);
            $character = $this->characters->for($memberUser);

            $memberRows[] = [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'role' => $member->role->value,
                'handle' => $profile->handle,
                'name' => $character['name'],
                'level' => $character['level'],
                'archetype' => $character['archetype'],
                'lineage' => $character['lineage'],
                'appearance' => $character['appearance'],
                'equipment' => $character['equipment'],
                'contribution_xp' => $member->contribution_xp,
                'contribution_tasks' => $member->contribution_tasks,
                'raid_damage' => $member->raid_damage,
                'joined_at' => $member->joined_at->toISOString(),
                'is_self' => $member->user_id === $user->id,
            ];
        }

        $canManageInvites = $membership->role->canManageInvites();
        $canManageRoles = $membership->role->canManageRoles();

        return [
            'membership' => [
                'id' => $membership->id,
                'role' => $membership->role->value,
                'can_manage_invites' => $canManageInvites,
                'can_manage_roles' => $canManageRoles,
                'is_leader' => $guild->leader_id === $user->id,
            ],
            'incoming_invites' => $incomingInvites,
            'guild' => [
                'id' => $guild->id,
                'slug' => $guild->slug,
                'name' => $guild->name,
                'tag' => $guild->tag,
                'description' => $guild->description,
                'total_xp' => $guild->total_xp,
                'member_count' => count($memberRows),
                'hall' => $hall,
                'members' => $memberRows,
                'invitable_friends' => $canManageInvites
                    ? $this->invitableFriends($user, $guild->id)
                    : [],
                'pending_invites' => $canManageInvites
                    ? $this->pendingInvites($guild->id)
                    : [],
                'active_raid' => $this->activeRaid($guild->id),
                'raid_bosses' => $this->raidBosses($hall['level']),
                'recent_contributions' => $this->recentContributions(
                    $guild->id,
                ),
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function incomingInvites(User $user): array
    {
        $invites = GuildInvite::query()
            ->where('receiver_id', $user->id)
            ->where('status', GuildInviteStatus::Pending->value)
            ->with(['guild', 'inviter'])
            ->latest()
            ->get();

        $rows = [];

        foreach ($invites as $invite) {
            $inviter = $invite->inviter()->firstOrFail();
            $profile = $this->socialProfiles->for($inviter);

            $rows[] = [
                'id' => $invite->id,
                'guild' => [
                    'slug' => $invite->guild->slug,
                    'name' => $invite->guild->name,
                    'tag' => $invite->guild->tag,
                    'total_xp' => $invite->guild->total_xp,
                    'hall' => $this->hall->for($invite->guild),
                ],
                'inviter' => [
                    'handle' => $profile->handle,
                    'name' => $this->characters->for($inviter)['name'],
                ],
            ];
        }

        return $rows;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function invitableFriends(User $user, int $guildId): array
    {
        $friendIds = $this->relationships->friendIds($user);

        if ($friendIds === []) {
            return [];
        }

        $memberUserIds = GuildMember::query()
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $pendingReceiverIds = GuildInvite::query()
            ->where('guild_id', $guildId)
            ->where('status', GuildInviteStatus::Pending->value)
            ->pluck('receiver_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $eligibleIds = array_values(array_diff(
            $friendIds,
            $memberUserIds,
            $pendingReceiverIds,
        ));

        if ($eligibleIds === []) {
            return [];
        }

        $friends = User::query()
            ->whereIn('id', $eligibleIds)
            ->orderBy('name')
            ->get();

        $rows = [];

        foreach ($friends as $friend) {
            $profile = $this->socialProfiles->for($friend);
            $character = $this->characters->for($friend);

            $rows[] = [
                'handle' => $profile->handle,
                'name' => $character['name'],
                'level' => $character['level'],
                'archetype' => $character['archetype'],
                'lineage' => $character['lineage'],
                'appearance' => $character['appearance'],
                'equipment' => $character['equipment'],
            ];
        }

        return $rows;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pendingInvites(int $guildId): array
    {
        $invites = GuildInvite::query()
            ->where('guild_id', $guildId)
            ->where('status', GuildInviteStatus::Pending->value)
            ->with('receiver')
            ->latest()
            ->get();

        $rows = [];

        foreach ($invites as $invite) {
            $receiver = $invite->receiver()->firstOrFail();
            $profile = $this->socialProfiles->for($receiver);

            $rows[] = [
                'id' => $invite->id,
                'handle' => $profile->handle,
                'name' => $this->characters->for($receiver)['name'],
            ];
        }

        return $rows;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function activeRaid(int $guildId): ?array
    {
        $guild = Guild::query()->findOrFail($guildId);
        $raid = $this->raids->activeForGuild($guild);

        if (! $raid) {
            return null;
        }

        $contributions = GuildRaidContribution::query()
            ->where('guild_raid_id', $raid->id)
            ->get()
            ->groupBy('user_id');

        $contributionRows = [];

        foreach ($contributions as $userId => $rows) {
            $memberUser = User::query()->find((int) $userId);

            if (! $memberUser) {
                continue;
            }

            $profile = $this->socialProfiles->for($memberUser);

            $contributionRows[] = [
                'user_id' => $memberUser->id,
                'handle' => $profile->handle,
                'name' => $this->characters->for($memberUser)['name'],
                'damage' => (int) $rows->sum('damage'),
                'turns' => $rows->count(),
            ];
        }

        usort(
            $contributionRows,
            fn (array $left, array $right) => $right['damage'] <=> $left['damage'],
        );

        return [
            'id' => $raid->id,
            'status' => $raid->status->value,
            'hp_remaining' => $raid->hp_remaining,
            'max_hp' => $raid->boss->max_hp,
            'total_damage' => $raid->total_damage,
            'started_at' => $raid->started_at->toISOString(),
            'ends_at' => $raid->ends_at->toISOString(),
            'boss' => [
                'slug' => $raid->boss->slug,
                'name' => $raid->boss->name,
                'description' => $raid->boss->description,
                'visual_key' => $raid->boss->visual_key,
                'reward_guild_xp' => $raid->boss->reward_guild_xp,
                'reward_member_xp' => $raid->boss->reward_member_xp,
                'reward_member_gold' => $raid->boss->reward_member_gold,
            ],
            'contributions' => $contributionRows,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function raidBosses(int $hallLevel): array
    {
        return RaidBoss::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (RaidBoss $boss) => [
                'id' => $boss->id,
                'slug' => $boss->slug,
                'name' => $boss->name,
                'description' => $boss->description,
                'visual_key' => $boss->visual_key,
                'max_hp' => $boss->max_hp,
                'min_hall_level' => $boss->min_hall_level,
                'duration_hours' => $boss->duration_hours,
                'reward_guild_xp' => $boss->reward_guild_xp,
                'reward_member_xp' => $boss->reward_member_xp,
                'reward_member_gold' => $boss->reward_member_gold,
                'unlocked' => $hallLevel >= $boss->min_hall_level,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentContributions(int $guildId): array
    {
        $contributions = GuildContribution::query()
            ->where('guild_id', $guildId)
            ->with('user')
            ->latest()
            ->limit(12)
            ->get();

        $rows = [];

        foreach ($contributions as $contribution) {
            $contributor = $contribution->user()->firstOrFail();
            $profile = $this->socialProfiles->for($contributor);

            $rows[] = [
                'id' => $contribution->id,
                'handle' => $profile->handle,
                'name' => $this->characters->for($contributor)['name'],
                'guild_xp' => $contribution->guild_xp,
                'difficulty' => $contribution->metadata['difficulty'] ?? null,
                'capped' => $contribution->reward_factor <= 0,
                'created_at' => $contribution->created_at?->toISOString(),
            ];
        }

        return $rows;
    }
}
