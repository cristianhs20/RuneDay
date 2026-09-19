<?php

namespace App\Domain\Game\Enums;

enum ItemSlot: string
{
    case Weapon = 'weapon';
    case Head = 'head';
    case Neck = 'neck';
    case Shoulder = 'shoulder';
    case Chest = 'chest';
    case Hands = 'hands';
    case Waist = 'waist';
    case Legs = 'legs';
    case Feet = 'feet';
    case Back = 'back';
    case Offhand = 'offhand';
    case Accessory = 'accessory';
}