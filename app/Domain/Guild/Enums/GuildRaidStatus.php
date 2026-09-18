<?php

namespace App\Domain\Guild\Enums;

enum GuildRaidStatus: string
{
    case Active = 'active';
    case Victory = 'victory';
    case Expired = 'expired';
    case Abandoned = 'abandoned';
}
