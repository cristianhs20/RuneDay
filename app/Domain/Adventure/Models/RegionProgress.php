<?php

namespace App\Domain\Adventure\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $region_id
 * @property int $enemy_victories
 * @property Carbon|null $boss_defeated_at
 * @property Carbon|null $first_entered_at
 */
class RegionProgress extends Model
{
    protected $table = 'adventure_region_progress';

    protected $attributes = [
        'enemy_victories' => 0,
    ];

    protected $fillable = [
        'user_id', 'region_id', 'enemy_victories',
        'boss_defeated_at', 'first_entered_at',
    ];

    protected function casts(): array
    {
        return [
            'boss_defeated_at' => 'datetime',
            'first_entered_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Region, $this> */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_id');
    }
}
