<?php

namespace App\Domain\Adventure\Enums;

enum EnemyType: string
{
    case Normal = 'normal';
    case Elite = 'elite';
    case Boss = 'boss';
}
