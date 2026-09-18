<?php

namespace App\Domain\Guild\Enums;

enum GuildRole: string
{
    case Leader = 'leader';
    case Officer = 'officer';
    case Member = 'member';

    public function canManageInvites(): bool
    {
        return $this !== self::Member;
    }

    public function canManageRoles(): bool
    {
        return $this === self::Leader;
    }
}
