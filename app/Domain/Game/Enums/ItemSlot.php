<?php

namespace App\Domain\Game\Enums;

enum ItemSlot: string
{
    case Weapon = 'weapon';
    case Head = 'head';
    case Chest = 'chest';
    case Feet = 'feet';
    case Back = 'back';
    case Accessory = 'accessory';
}
