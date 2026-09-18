<?php

namespace App\Domain\Adventure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string $description
 * @property string $visual_key
 * @property int $min_level
 * @property int $boss_unlock_victories
 * @property int $sort_order
 */
class Region extends Model
{
    protected $table = 'adventure_regions';

    protected $fillable = [
        'slug', 'name', 'description', 'visual_key',
        'min_level', 'boss_unlock_victories', 'sort_order',
    ];

    /** @return HasMany<Enemy, $this> */
    public function enemies(): HasMany
    {
        return $this->hasMany(Enemy::class, 'region_id');
    }

    /** @return HasMany<AdventureObjective, $this> */
    public function objectives(): HasMany
    {
        return $this->hasMany(AdventureObjective::class, 'region_id');
    }
}
