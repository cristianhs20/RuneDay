<?php

namespace App\Domain\Guild\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Guild\Enums\GuildInviteStatus;
use App\Domain\Guild\Enums\GuildRole;
use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\GuildInvite;
use App\Domain\Guild\Models\GuildMember;
use App\Domain\Social\Models\SocialProfile;
use App\Domain\Social\Services\RelationshipService;
use App\Domain\Social\Services\SocialProfileService;
use App\Models\User;
use App\Notifications\Guild\GuildInviteAcceptedNotification;
use App\Notifications\Guild\GuildInviteNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GuildMembershipService
{
    public function __construct(
        private readonly GuildHallService $hall,
        private readonly RelationshipService $relationships,
        private readonly SocialProfileService $socialProfiles,
    ) {}

    public function membership(User $user): ?GuildMember
    {
        return GuildMember::query()
            ->where('user_id', $user->id)
            ->with('guild')
            ->first();
    }

    /**
     * @param  array{name: string, tag: string, description?: string|null}  $data
     */
    public function createGuild(User $user, array $data): Guild
    {
        return DB::transaction(function () use ($user, $data) {
            if ($this->membership($user)) {
                throw ValidationException::withMessages([
                    'guild' => 'You already belong to a guild.',
                ]);
            }

            $character = CharacterProfile::firstOrCreate([
                'user_id' => $user->id,
            ]);

            if (! $character->character_created_at) {
                throw ValidationException::withMessages([
                    'guild' => 'Create your hero before founding a guild.',
                ]);
            }

            $guild = Guild::create([
                'slug' => $this->uniqueSlug($data['name']),
                'name' => $data['name'],
                'tag' => strtoupper($data['tag']),
                'description' => $data['description'] ?? null,
                'leader_id' => $user->id,
                'total_xp' => 0,
            ]);

            GuildMember::create([
                'guild_id' => $guild->id,
                'user_id' => $user->id,
                'role' => GuildRole::Leader->value,
                'joined_at' => now(),
            ]);

            return $guild;
        });
    }

    public function invite(
        User $actor,
        SocialProfile $targetProfile,
    ): GuildInvite {
        return DB::transaction(function () use ($actor, $targetProfile) {
            $membership = $this->requireMembership($actor);

            if (! $membership->role->canManageInvites()) {
                abort(403);
            }

            $guild = Guild::query()
                ->lockForUpdate()
                ->findOrFail($membership->guild_id);
            $target = $targetProfile->user()->firstOrFail();

            if (! $this->relationships->areFriends($actor, $target)) {
                throw ValidationException::withMessages([
                    'friend' => 'Guild invitations can only be sent to accepted friends.',
                ]);
            }

            if (GuildMember::query()->where('user_id', $target->id)->exists()) {
                throw ValidationException::withMessages([
                    'friend' => 'This hero already belongs to a guild.',
                ]);
            }

            $this->assertCapacity($guild);

            $invite = GuildInvite::query()
                ->where('guild_id', $guild->id)
                ->where('receiver_id', $target->id)
                ->lockForUpdate()
                ->first();

            if ($invite?->status === GuildInviteStatus::Pending) {
                return $invite;
            }

            if ($invite) {
                $invite->forceFill([
                    'inviter_id' => $actor->id,
                    'status' => GuildInviteStatus::Pending->value,
                    'responded_at' => null,
                ])->save();
            } else {
                $invite = GuildInvite::create([
                    'guild_id' => $guild->id,
                    'inviter_id' => $actor->id,
                    'receiver_id' => $target->id,
                    'status' => GuildInviteStatus::Pending->value,
                ]);
            }

            $target->notify(new GuildInviteNotification(
                $guild,
                $this->socialProfiles->for($actor),
            ));

            return $invite;
        });
    }

    public function accept(User $user, GuildInvite $invite): GuildMember
    {
        return DB::transaction(function () use ($user, $invite) {
            $invite = GuildInvite::query()
                ->lockForUpdate()
                ->findOrFail($invite->id);

            abort_unless($invite->receiver_id === $user->id, 403);

            if ($invite->status !== GuildInviteStatus::Pending) {
                throw ValidationException::withMessages([
                    'invite' => 'This guild invitation is no longer pending.',
                ]);
            }

            if ($this->membership($user)) {
                throw ValidationException::withMessages([
                    'invite' => 'Leave your current guild before joining another one.',
                ]);
            }

            $guild = Guild::query()
                ->lockForUpdate()
                ->findOrFail($invite->guild_id);
            $inviter = $invite->inviter()->firstOrFail();

            if (! $this->relationships->areFriends($inviter, $user)) {
                throw ValidationException::withMessages([
                    'invite' => 'The friendship required for this invitation is no longer active.',
                ]);
            }

            $this->assertCapacity($guild);

            $member = GuildMember::create([
                'guild_id' => $guild->id,
                'user_id' => $user->id,
                'role' => GuildRole::Member->value,
                'joined_at' => now(),
            ]);

            $invite->forceFill([
                'status' => GuildInviteStatus::Accepted->value,
                'responded_at' => now(),
            ])->save();

            GuildInvite::query()
                ->where('receiver_id', $user->id)
                ->where('id', '!=', $invite->id)
                ->where('status', GuildInviteStatus::Pending->value)
                ->update([
                    'status' => GuildInviteStatus::Canceled->value,
                    'responded_at' => now(),
                ]);

            $inviter->notify(new GuildInviteAcceptedNotification(
                $guild,
                $this->socialProfiles->for($user),
            ));

            return $member;
        });
    }

    public function decline(User $user, GuildInvite $invite): GuildInvite
    {
        abort_unless($invite->receiver_id === $user->id, 403);

        if ($invite->status !== GuildInviteStatus::Pending) {
            throw ValidationException::withMessages([
                'invite' => 'This guild invitation is no longer pending.',
            ]);
        }

        $invite->forceFill([
            'status' => GuildInviteStatus::Declined->value,
            'responded_at' => now(),
        ])->save();

        return $invite->fresh();
    }

    public function cancelInvite(User $actor, GuildInvite $invite): GuildInvite
    {
        $membership = $this->requireMembership($actor);

        abort_unless($membership->guild_id === $invite->guild_id, 403);
        abort_unless($membership->role->canManageInvites(), 403);

        if ($invite->status === GuildInviteStatus::Pending) {
            $invite->forceFill([
                'status' => GuildInviteStatus::Canceled->value,
                'responded_at' => now(),
            ])->save();
        }

        return $invite->fresh();
    }

    public function setRole(
        User $actor,
        GuildMember $target,
        GuildRole $role,
    ): GuildMember {
        $actorMembership = $this->requireMembership($actor);

        abort_unless($actorMembership->guild_id === $target->guild_id, 403);
        abort_unless($actorMembership->role->canManageRoles(), 403);

        if ($target->role === GuildRole::Leader || $role === GuildRole::Leader) {
            throw ValidationException::withMessages([
                'role' => 'Use leadership transfer to change the guild leader.',
            ]);
        }

        $target->forceFill(['role' => $role->value])->save();

        return $target->fresh();
    }

    public function transferLeadership(
        User $actor,
        GuildMember $target,
    ): GuildMember {
        return DB::transaction(function () use ($actor, $target) {
            $actorMembership = $this->requireMembership($actor);

            abort_unless($actorMembership->role === GuildRole::Leader, 403);
            abort_unless($actorMembership->guild_id === $target->guild_id, 403);

            if ($target->user_id === $actor->id) {
                throw ValidationException::withMessages([
                    'member' => 'You already lead this guild.',
                ]);
            }

            $guild = Guild::query()
                ->lockForUpdate()
                ->findOrFail($actorMembership->guild_id);

            $actorMembership->forceFill([
                'role' => GuildRole::Officer->value,
            ])->save();

            $target->forceFill([
                'role' => GuildRole::Leader->value,
            ])->save();

            $guild->forceFill(['leader_id' => $target->user_id])->save();

            return $target->fresh();
        });
    }

    public function removeMember(User $actor, GuildMember $target): void
    {
        $actorMembership = $this->requireMembership($actor);

        abort_unless($actorMembership->guild_id === $target->guild_id, 403);

        if ($target->role === GuildRole::Leader) {
            throw ValidationException::withMessages([
                'member' => 'The guild leader cannot be removed.',
            ]);
        }

        $allowed = $actorMembership->role === GuildRole::Leader
            || (
                $actorMembership->role === GuildRole::Officer
                && $target->role === GuildRole::Member
            );

        abort_unless($allowed, 403);

        $target->delete();
    }

    public function leave(User $user): void
    {
        $membership = $this->requireMembership($user);

        if ($membership->role === GuildRole::Leader) {
            throw ValidationException::withMessages([
                'guild' => 'Transfer leadership or disband the guild before leaving.',
            ]);
        }

        $membership->delete();
    }

    /**
     * @param  array{name: string, tag: string, description?: string|null}  $data
     */
    public function updateGuild(
        User $actor,
        Guild $guild,
        array $data,
    ): Guild {
        $membership = $this->requireMembership($actor);

        abort_unless($membership->guild_id === $guild->id, 403);
        abort_unless($membership->role === GuildRole::Leader, 403);

        $guild->update([
            'name' => $data['name'],
            'tag' => strtoupper($data['tag']),
            'description' => $data['description'] ?? null,
        ]);

        return $guild->fresh();
    }

    public function disband(User $user): void
    {
        $membership = $this->requireMembership($user);

        abort_unless($membership->role === GuildRole::Leader, 403);

        $membership->guild()->firstOrFail()->delete();
    }

    public function requireMembership(User $user): GuildMember
    {
        $membership = $this->membership($user);

        if (! $membership) {
            throw ValidationException::withMessages([
                'guild' => 'You do not belong to a guild.',
            ]);
        }

        return $membership;
    }

    private function assertCapacity(Guild $guild): void
    {
        $capacity = $this->hall->for($guild)['member_capacity'];
        $count = GuildMember::query()
            ->where('guild_id', $guild->id)
            ->count();

        if ($count >= $capacity) {
            throw ValidationException::withMessages([
                'guild' => 'This Guild Hall is at member capacity.',
            ]);
        }
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'guild';
        $candidate = $base;
        $attempt = 1;

        while (Guild::query()->where('slug', $candidate)->exists()) {
            $attempt++;
            $candidate = $base.'-'.$attempt;
        }

        return $candidate;
    }
}
