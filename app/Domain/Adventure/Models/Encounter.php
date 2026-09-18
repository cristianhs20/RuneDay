<?php

namespace App\Domain\Adventure\Models;

use App\Domain\Adventure\Enums\EncounterStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $region_id
 * @property int $enemy_id
 * @property EncounterStatus $status
 * @property int $enemy_hp_remaining
 * @property int $hero_hp_remaining
 * @property int $hero_max_hp
 * @property int $damage_dealt
 * @property int $turns
 * @property int $rests
 * @property array<string, mixed>|null $snapshot
 * @property Carbon $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $settled_at
 */
class Encounter extends Model
{
    protected $table = 'adventure_encounters';

    protected $fillable = [
        'user_id', 'region_id', 'enemy_id', 'status',
        'enemy_hp_remaining', 'hero_hp_remaining', 'hero_max_hp',
        'damage_dealt', 'turns', 'rests', 'snapshot',
        'started_at', 'completed_at', 'settled_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => EncounterStatus::class,
            'snapshot' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'settled_at' => 'datetime',
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

    /** @return BelongsTo<Enemy, $this> */
    public function enemy(): BelongsTo
    {
        return $this->belongsTo(Enemy::class, 'enemy_id');
    }

    /** @return HasMany<CombatAction, $this> */
    public function actions(): HasMany
    {
        return $this->hasMany(CombatAction::class, 'encounter_id');
    }
}
