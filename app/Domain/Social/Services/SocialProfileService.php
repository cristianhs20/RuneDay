<?php

namespace App\Domain\Social\Services;

use App\Domain\Social\Models\SocialProfile;
use App\Models\User;
use Illuminate\Support\Str;

class SocialProfileService
{
    public function for(User $user): SocialProfile
    {
        $existing = SocialProfile::query()
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        return SocialProfile::create([
            'user_id' => $user->id,
            'handle' => $this->uniqueHandle($user),
            'friend_code' => $this->uniqueFriendCode(),
        ]);
    }

    private function uniqueHandle(User $user): string
    {
        $base = Str::of($user->name)
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9]+/', '_')
            ->trim('_')
            ->substr(0, 20)
            ->toString();

        if (strlen($base) < 3) {
            $base = 'hero';
        }

        $candidate = $base;
        $attempt = 0;

        while (SocialProfile::query()->where('handle', $candidate)->exists()) {
            $attempt++;
            $suffix = strtolower(substr($this->uniqueFriendCode(), 0, 4));
            $candidate = substr($base, 0, 19).'_'.$suffix;

            if ($attempt > 20) {
                $candidate = 'hero_'.$user->id.'_'.strtolower(Str::random(4));
            }
        }

        return $candidate;
    }

    private function uniqueFriendCode(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        do {
            $code = '';

            for ($i = 0; $i < 8; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
        } while (SocialProfile::query()->where('friend_code', $code)->exists());

        return $code;
    }
}
