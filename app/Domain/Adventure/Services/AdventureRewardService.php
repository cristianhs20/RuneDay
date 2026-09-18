<?php

namespace App\Domain\Adventure\Services;

use App\Domain\Adventure\Models\AdventureProfile;
use App\Domain\Adventure\Models\AdventureTransaction;
use Illuminate\Support\Facades\DB;

class AdventureRewardService
{
    /**
     * @param  array<string, mixed>  $metadata
     * @return array{granted: bool, renown: int}
     */
    public function grant(
        int $userId,
        string $sourceType,
        int $sourceId,
        int $renown,
        array $metadata = [],
    ): array {
        return DB::transaction(function () use (
            $userId,
            $sourceType,
            $sourceId,
            $renown,
            $metadata,
        ) {
            $existing = AdventureTransaction::query()
                ->where('user_id', $userId)
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return [
                    'granted' => false,
                    'renown' => $existing->renown_delta,
                ];
            }

            AdventureProfile::firstOrCreate(['user_id' => $userId]);

            $profile = AdventureProfile::query()
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->firstOrFail();

            $profile->forceFill([
                'renown' => $profile->renown + $renown,
            ])->save();

            AdventureTransaction::create([
                'user_id' => $userId,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'renown_delta' => $renown,
                'metadata' => $metadata,
            ]);

            return ['granted' => true, 'renown' => $renown];
        });
    }
}
