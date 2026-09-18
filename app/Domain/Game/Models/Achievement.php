<?php

namespace App\Domain\Game\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string $description
 * @property string $icon
 * @property string $criteria_type
 * @property int $threshold
 * @property int $reward_xp
 * @property int $reward_gold
 * @property int $sort_order
 */
class Achievement extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'icon', 'criteria_type',
        'threshold', 'reward_xp', 'reward_gold', 'sort_order',
    ];

    /** @return HasMany<AchievementUnlock, $this> */
    public function unlocks(): HasMany
    {
        return $this->hasMany(AchievementUnlock::class);
    }
}
