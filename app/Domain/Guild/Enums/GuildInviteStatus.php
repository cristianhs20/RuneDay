<?php

namespace App\Domain\Guild\Enums;

enum GuildInviteStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Declined = 'declined';
    case Canceled = 'canceled';
}
