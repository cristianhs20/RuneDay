<?php

namespace App\Notifications\Social;

use App\Domain\Social\Models\SocialProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SocialReactionNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly SocialProfile $reactor,
        private readonly string $reaction,
        private readonly string $activityType,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'social_reaction',
            'title' => 'New reaction',
            'body' => '@'.$this->reactor->handle.' reacted '.$this->reaction.' to your '.$this->activityLabel().'.',
            'handle' => $this->reactor->handle,
            'reaction' => $this->reaction,
        ];
    }

    private function activityLabel(): string
    {
        return match ($this->activityType) {
            'achievement_unlocked' => 'achievement',
            'boss_victory' => 'boss victory',
            'loot_found' => 'loot find',
            'level_up' => 'level-up',
            'region_unlocked' => 'region unlock',
            default => 'RuneDay progress',
        };
    }
}
