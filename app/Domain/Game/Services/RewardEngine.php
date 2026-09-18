<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\RewardTransaction;
use Illuminate\Support\Facades\DB;

class RewardEngine
{
    /**
     * @param  array<string, mixed>  $metadata
     * @return array{granted: bool, xp: int, gold: int}
     */
    public function grant(
        int $userId,
        string $sourceType,
        int $sourceId,
        int $xp,
        int $gold = 0,
        array $metadata = [],
    ): array {
        return DB::transaction(function () use ($userId, $sourceType, $sourceId, $xp, $gold, $metadata) {
            $existing = RewardTransaction::query()
                ->where('user_id', $userId)
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return ['granted' => false, 'xp' => $existing->xp_delta, 'gold' => $existing->gold_delta];
            }

            CharacterProfile::firstOrCreate(['user_id' => $userId]);
            $profile = CharacterProfile::query()
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $profile->grant($xp, $gold);

            RewardTransaction::create([
                'user_id' => $userId,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'xp_delta' => $xp,
                'gold_delta' => $gold,
                'metadata' => $metadata,
            ]);

            return ['granted' => true, 'xp' => $xp, 'gold' => $gold];
        });
    }
}
