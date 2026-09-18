<?php

namespace App\Notifications\Guild;

use App\Domain\Guild\Models\Guild;
use App\Domain\Social\Models\SocialProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GuildInviteNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Guild $guild,
        private readonly SocialProfile $inviter,
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
            'kind' => 'guild_invite',
            'title' => 'Guild invitation',
            'body' => '@'.$this->inviter->handle.' invited you to ['.$this->guild->tag.'] '.$this->guild->name.'.',
            'guild_slug' => $this->guild->slug,
            'guild_name' => $this->guild->name,
            'guild_tag' => $this->guild->tag,
        ];
    }
}
