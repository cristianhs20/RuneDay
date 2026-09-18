<?php

namespace App\Notifications\Guild;

use App\Domain\Guild\Models\Guild;
use App\Domain\Guild\Models\RaidBoss;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GuildRaidVictoryNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Guild $guild,
        private readonly RaidBoss $boss,
        private readonly int $xp,
        private readonly int $gold,
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
            'kind' => 'guild_raid_victory',
            'title' => 'Raid victory',
            'body' => '['.$this->guild->tag.'] defeated '.$this->boss->name.'. You earned +'.$this->xp.' XP and +'.$this->gold.' gold.',
            'guild_slug' => $this->guild->slug,
            'boss' => $this->boss->name,
        ];
    }
}
