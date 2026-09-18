<?php

namespace App\Domain\Guild\Services;

use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\GuildXpTransaction;
use Illuminate\Support\Facades\DB;

class GuildXpService
{
    public function __construct(private readonly GuildHallService $hall) {}

    /**
     * @param  array<string, mixed>  $metadata
     * @return array{
     *     granted: bool,
     *     xp: int,
     *     total_xp: int,
     *     hall_before: array<string, mixed>,
     *     hall_after: array<string, mixed>,
     *     hall_upgraded: bool
     * }
     */
    public function grant(
        Guild $guild,
        ?int $userId,
        string $sourceType,
        int $sourceId,
        int $xp,
        array $metadata = [],
    ): array {
        return DB::transaction(function () use (
            $guild,
            $userId,
            $sourceType,
            $sourceId,
            $xp,
            $metadata,
        ) {
            $guild = Guild::query()
                ->lockForUpdate()
                ->findOrFail($guild->id);

            $existing = GuildXpTransaction::query()
                ->where('guild_id', $guild->id)
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->lockForUpdate()
                ->first();

            $before = $this->hall->for($guild);

            if ($existing) {
                return [
                    'granted' => false,
                    'xp' => $existing->xp_delta,
                    'total_xp' => $guild->total_xp,
                    'hall_before' => $before,
                    'hall_after' => $before,
                    'hall_upgraded' => false,
                ];
            }

            $guild->forceFill([
                'total_xp' => max(0, $guild->total_xp + $xp),
            ])->save();

            GuildXpTransaction::create([
                'guild_id' => $guild->id,
                'user_id' => $userId,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'xp_delta' => $xp,
                'metadata' => $metadata,
            ]);

            $after = $this->hall->for($guild);

            return [
                'granted' => true,
                'xp' => $xp,
                'total_xp' => $guild->total_xp,
                'hall_before' => $before,
                'hall_after' => $after,
                'hall_upgraded' => $after['level'] > $before['level'],
            ];
        });
    }
}
