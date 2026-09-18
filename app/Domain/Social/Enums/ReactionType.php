<?php

namespace App\Domain\Social\Enums;

enum ReactionType: string
{
    case Cheer = 'cheer';
    case Fire = 'fire';
    case Sword = 'sword';
    case Crown = 'crown';
}
