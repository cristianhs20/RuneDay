<?php

namespace App\Domain\Social\Services;

use App\Domain\Social\Models\SocialActivity;
use App\Models\User;

class SocialActivityPublisher
{
    public function __construct(private readonly SocialProfileService $profiles) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function publish(
        User $user,
        string $type,
        string $sourceType,
        int $sourceId,
        array $data,
    ): SocialActivity {
        $profile = $this->profiles->for($user);

        return SocialActivity::firstOrCreate(
            [
                'user_id' => $user->id,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
            ],
            [
                'type' => $type,
                'visibility' => $profile->activity_visibility->value,
                'data' => $data,
            ],
        );
    }
}
