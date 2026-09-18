<?php

namespace App\Domain\Game\Enums;

enum CharacterArchetype: string
{
    case Wanderer = 'wanderer';
    case Warden = 'warden';
    case Rogue = 'rogue';
    case Arcanist = 'arcanist';
}
