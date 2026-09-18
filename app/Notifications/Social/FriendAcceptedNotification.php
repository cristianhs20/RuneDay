<?php

namespace App\Notifications\Social;

use App\Domain\Social\Models\SocialProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FriendAcceptedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly SocialProfile $friend) {}

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
            'kind' => 'friend_accepted',
            'title' => 'Friend request accepted',
            'body' => '@'.$this->friend->handle.' is now your friend.',
            'handle' => $this->friend->handle,
        ];
    }
}
