<?php

namespace App\Domain\Guild\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string $description
 * @property string $visual_key
 * @property int $max_hp
 * @property int $min_hall_level
 * @property int $duration_hours
 * @property int $reward_guild_xp
 * @property int $reward_member_xp
 * @property int $reward_member_gold
 * @property int $sort_order
 */
class RaidBoss extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'visual_key', 'max_hp',
        'min_hall_level', 'duration_hours', 'reward_guild_xp',
        'reward_member_xp', 'reward_member_gold', 'sort_order',
    ];

    /** @return HasMany<GuildRaid, $this> */
    public function raids(): HasMany
    {
        return $this->hasMany(GuildRaid::class);
    }
}
