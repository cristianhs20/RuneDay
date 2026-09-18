<?php

namespace App\Domain\Guild\Services;

use App\Domain\Guild\Enums\GuildRaidStatus;
use App\Domain\Guild\Enums\GuildRole;
use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\GuildRaid;
use App\Domain\Guild\Models\RaidBoss;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GuildRaidService
{
    public function __construct(
        private readonly GuildMembershipService $memberships,
        private readonly GuildHallService $hall,
    ) {}

    public function start(User $actor, RaidBoss $boss): GuildRaid
    {
        return DB::transaction(function () use ($actor, $boss) {
            $membership = $this->memberships->requireMembership($actor);

            if (! $membership->role->canManageInvites()) {
                abort(403);
            }

            $guild = Guild::query()
                ->lockForUpdate()
                ->findOrFail($membership->guild_id);

            $this->expireStale($guild);

            if (GuildRaid::query()
                ->where('guild_id', $guild->id)
                ->where('status', GuildRaidStatus::Active->value)
                ->exists()) {
                throw ValidationException::withMessages([
                    'raid' => 'Finish the active raid before starting another one.',
                ]);
            }

            $hall = $this->hall->for($guild);

            if ($hall['level'] < $boss->min_hall_level) {
                throw ValidationException::withMessages([
                    'raid' => 'Your Guild Hall has not reached the required tier.',
                ]);
            }

            return GuildRaid::create([
                'guild_id' => $guild->id,
                'raid_boss_id' => $boss->id,
                'status' => GuildRaidStatus::Active->value,
                'hp_remaining' => $boss->max_hp,
                'total_damage' => 0,
                'started_at' => now(),
                'ends_at' => now()->addHours($boss->duration_hours),
            ])->load(['guild', 'boss']);
        });
    }

    public function activeForGuild(Guild $guild): ?GuildRaid
    {
        $this->expireStale($guild);

        return GuildRaid::query()
            ->where('guild_id', $guild->id)
            ->where('status', GuildRaidStatus::Active->value)
            ->with('boss')
            ->latest('started_at')
            ->first();
    }

    public function abandon(User $actor, GuildRaid $raid): GuildRaid
    {
        $membership = $this->memberships->requireMembership($actor);

        abort_unless($membership->guild_id === $raid->guild_id, 403);
        abort_unless($membership->role === GuildRole::Leader, 403);

        if ($raid->status !== GuildRaidStatus::Active) {
            return $raid;
        }

        $raid->forceFill([
            'status' => GuildRaidStatus::Abandoned->value,
            'completed_at' => now(),
        ])->save();

        return $raid->fresh();
    }

    private function expireStale(Guild $guild): void
    {
        GuildRaid::query()
            ->where('guild_id', $guild->id)
            ->where('status', GuildRaidStatus::Active->value)
            ->where('ends_at', '<=', now())
            ->update([
                'status' => GuildRaidStatus::Expired->value,
                'completed_at' => now(),
            ]);
    }
}
