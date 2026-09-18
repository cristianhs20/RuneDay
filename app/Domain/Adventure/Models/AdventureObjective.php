<?php

namespace App\Domain\Adventure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $region_id
 * @property string $slug
 * @property string $name
 * @property string $description
 * @property string $criteria_type
 * @property int $threshold
 * @property int $reward_gold
 * @property int $reward_renown
 * @property int $sort_order
 */
class AdventureObjective extends Model
{
    protected $table = 'adventure_objectives';

    protected $fillable = [
        'region_id', 'slug', 'name', 'description', 'criteria_type',
        'threshold', 'reward_gold', 'reward_renown', 'sort_order',
    ];

    /** @return BelongsTo<Region, $this> */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    /** @return HasMany<ObjectiveClaim, $this> */
    public function claims(): HasMany
    {
        return $this->hasMany(ObjectiveClaim::class, 'objective_id');
    }
}
