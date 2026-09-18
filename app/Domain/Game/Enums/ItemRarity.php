<?php

namespace App\Domain\Game\Enums;

enum ItemRarity: string
{
    case Common = 'common';
    case Uncommon = 'uncommon';
    case Rare = 'rare';
    case Epic = 'epic';

    public function rank(): int
    {
        return match ($this) {
            self::Common => 1,
            self::Uncommon => 2,
            self::Rare => 3,
            self::Epic => 4,
        };
    }
}
