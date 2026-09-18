<?php

namespace App\Domain\Productivity\Enums;

enum TaskDifficulty: string
{
    case Easy = 'easy';
    case Normal = 'normal';
    case Hard = 'hard';
    case Epic = 'epic';

    public function xp(): int
    {
        return match ($this) {
            self::Easy => 15,
            self::Normal => 30,
            self::Hard => 60,
            self::Epic => 120,
        };
    }

    public function gold(): int
    {
        return match ($this) {
            self::Easy => 5,
            self::Normal => 10,
            self::Hard => 20,
            self::Epic => 40,
        };
    }
}
