<?php

namespace App\Notifications\Guild;

use App\Domain\Guild\Models\Guild;
use App\Domain\Social\Models\SocialProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GuildInviteAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Guild $guild,
        private readonly SocialProfile $member,
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
            'kind' => 'guild_joined',
            'title' => 'Guild member joined',
            'body' => '@'.$this->member->handle.' joined ['.$this->guild->tag.'] '.$this->guild->name.'.',
            'guild_slug' => $this->guild->slug,
            'handle' => $this->member->handle,
        ];
    }
}
