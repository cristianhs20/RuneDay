<?php

namespace App\Domain\Adventure\Enums;

enum EncounterStatus: string
{
    case Active = 'active';
    case Victory = 'victory';
    case Abandoned = 'abandoned';
}
