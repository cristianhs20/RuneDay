<?php

namespace App\Notifications\Social;

use App\Domain\Social\Models\SocialProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FriendRequestNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly SocialProfile $sender) {}

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
            'kind' => 'friend_request',
            'title' => 'New friend request',
            'body' => '@'.$this->sender->handle.' wants to join your party.',
            'handle' => $this->sender->handle,
        ];
    }
}
