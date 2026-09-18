<?php

namespace App\Domain\Guild\Services;

use App\Domain\Guild\Models\Guild;

class GuildHallService
{
    /**
     * @return array{
     *     level: int,
     *     key: string,
     *     name: string,
     *     min_xp: int,
     *     next_xp: int|null,
     *     member_capacity: int,
     *     progress_percent: int
     * }
     */
    public function for(Guild $guild): array
    {
        return $this->forXp($guild->total_xp);
    }

    /**
     * @return array{
     *     level: int,
     *     key: string,
     *     name: string,
     *     min_xp: int,
     *     next_xp: int|null,
     *     member_capacity: int,
     *     progress_percent: int
     * }
     */
    public function forXp(int $xp): array
    {
        $tiers = $this->tiers();
        $current = $tiers[0];
        $next = null;

        foreach ($tiers as $index => $tier) {
            if ($xp >= $tier['min_xp']) {
                $current = $tier;
                $next = $tiers[$index + 1] ?? null;
            }
        }

        $progress = 100;

        if ($next) {
            $range = max(1, $next['min_xp'] - $current['min_xp']);
            $progress = (int) floor(
                (($xp - $current['min_xp']) / $range) * 100,
            );
            $progress = max(0, min(100, $progress));
        }

        return [
            ...$current,
            'next_xp' => $next['min_xp'] ?? null,
            'progress_percent' => $progress,
        ];
    }

    /**
     * @return array<int, array{
     *     level: int,
     *     key: string,
     *     name: string,
     *     min_xp: int,
     *     member_capacity: int
     * }>
     */
    public function tiers(): array
    {
        return [
            [
                'level' => 1,
                'key' => 'camp',
                'name' => 'Camp',
                'min_xp' => 0,
                'member_capacity' => 10,
            ],
            [
                'level' => 2,
                'key' => 'tavern',
                'name' => 'Tavern',
                'min_xp' => 500,
                'member_capacity' => 20,
            ],
            [
                'level' => 3,
                'key' => 'guild_hall',
                'name' => 'Guild Hall',
                'min_xp' => 1500,
                'member_capacity' => 30,
            ],
            [
                'level' => 4,
                'key' => 'fortress',
                'name' => 'Fortress',
                'min_xp' => 3500,
                'member_capacity' => 40,
            ],
            [
                'level' => 5,
                'key' => 'castle',
                'name' => 'Castle',
                'min_xp' => 7500,
                'member_capacity' => 50,
            ],
        ];
    }
}
