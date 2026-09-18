<?php

namespace App\Domain\Social\Enums;

enum FriendRequestStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Declined = 'declined';
    case Canceled = 'canceled';
}
