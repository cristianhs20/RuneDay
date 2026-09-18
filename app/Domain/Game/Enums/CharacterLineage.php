<?php

namespace App\Domain\Game\Enums;

enum CharacterLineage: string
{
    case Human = 'human';
    case Elf = 'elf';
    case Skeleton = 'skeleton';
    case Ogre = 'ogre';
}
