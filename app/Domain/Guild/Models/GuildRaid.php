<?php

namespace App\Domain\Guild\Models;

use App\Domain\Guild\Enums\GuildRaidStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $guild_id
 * @property int $raid_boss_id
 * @property GuildRaidStatus $status
 * @property int $hp_remaining
 * @property int $total_damage
 * @property Carbon $started_at
 * @property Carbon $ends_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $settled_at
 */
class GuildRaid extends Model
{
    protected $fillable = [
        'guild_id', 'raid_boss_id', 'status', 'hp_remaining', 'total_damage',
        'started_at', 'ends_at', 'completed_at', 'settled_at',
    ];

    protected $attributes = [
        'status' => 'active',
        'total_damage' => 0,
    ];

    protected function casts(): array
    {
        return [
            'status' => GuildRaidStatus::class,
            'started_at' => 'datetime',
            'ends_at' => 'datetime',
            'completed_at' => 'datetime',
            'settled_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Guild, $this> */
    public function guild(): BelongsTo
    {
        return $this->belongsTo(Guild::class);
    }

    /** @return BelongsTo<RaidBoss, $this> */
    public function boss(): BelongsTo
    {
        return $this->belongsTo(RaidBoss::class, 'raid_boss_id');
    }

    /** @return HasMany<GuildRaidContribution, $this> */
    public function contributions(): HasMany
    {
        return $this->hasMany(GuildRaidContribution::class);
    }
}
