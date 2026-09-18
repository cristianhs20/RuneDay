<?php

namespace App\Domain\Guild\Services;

use App\Domain\Game\Services\RewardEngine;
use App\Domain\Guild\Enums\GuildRaidStatus;
use App\Domain\Guild\Models\GuildRaid;
use App\Domain\Guild\Models\GuildRaidContribution;
use App\Models\User;
use App\Notifications\Guild\GuildRaidVictoryNotification;
use Illuminate\Support\Facades\DB;

class GuildRaidSettlementService
{
    public function __construct(
        private readonly GuildXpService $guildXp,
        private readonly RewardEngine $rewards,
    ) {}

    /**
     * @return array{
     *     guild_xp: int,
     *     member_xp: int,
     *     member_gold: int,
     *     rewarded_members: int,
     *     hall_upgraded: bool,
     *     hall: array<string, mixed>
     * }
     */
    public function settle(GuildRaid $raid): array
    {
        return DB::transaction(function () use ($raid) {
            $raid = GuildRaid::query()
                ->with(['guild', 'boss'])
                ->lockForUpdate()
                ->findOrFail($raid->id);

            if ($raid->settled_at) {
                return [
                    'guild_xp' => 0,
                    'member_xp' => 0,
                    'member_gold' => 0,
                    'rewarded_members' => 0,
                    'hall_upgraded' => false,
                    'hall' => app(GuildHallService::class)->for($raid->guild),
                ];
            }

            $boss = $raid->boss;
            $guild = $raid->guild;

            $guildReward = $this->guildXp->grant(
                $guild,
                null,
                'raid_victory',
                $raid->id,
                $boss->reward_guild_xp,
                ['boss' => $boss->slug],
            );

            $contributorIds = GuildRaidContribution::query()
                ->where('guild_raid_id', $raid->id)
                ->where('damage', '>', 0)
                ->distinct()
                ->pluck('user_id')
                ->map(fn ($id) => (int) $id)
                ->all();

            foreach ($contributorIds as $userId) {
                $this->rewards->grant(
                    $userId,
                    'guild_raid_victory',
                    $raid->id,
                    $boss->reward_member_xp,
                    $boss->reward_member_gold,
                    [
                        'guild_id' => $guild->id,
                        'guild_tag' => $guild->tag,
                        'boss' => $boss->slug,
                    ],
                );

                $user = User::query()->find($userId);

                if ($user) {
                    $user->notify(new GuildRaidVictoryNotification(
                        $guild,
                        $boss,
                        $boss->reward_member_xp,
                        $boss->reward_member_gold,
                    ));
                }
            }

            $raid->forceFill([
                'status' => GuildRaidStatus::Victory->value,
                'hp_remaining' => 0,
                'completed_at' => $raid->completed_at ?? now(),
                'settled_at' => now(),
            ])->save();

            return [
                'guild_xp' => $boss->reward_guild_xp,
                'member_xp' => $boss->reward_member_xp,
                'member_gold' => $boss->reward_member_gold,
                'rewarded_members' => count($contributorIds),
                'hall_upgraded' => $guildReward['hall_upgraded'],
                'hall' => $guildReward['hall_after'],
            ];
        });
    }
}
