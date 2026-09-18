<?php

namespace App\Domain\Guild\Models;

use App\Domain\Guild\Enums\GuildRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $guild_id
 * @property int $user_id
 * @property GuildRole $role
 * @property int $contribution_xp
 * @property int $contribution_tasks
 * @property int $raid_damage
 * @property Carbon $joined_at
 */
class GuildMember extends Model
{
    protected $fillable = [
        'guild_id', 'user_id', 'role', 'contribution_xp',
        'contribution_tasks', 'raid_damage', 'joined_at',
    ];

    protected $attributes = [
        'role' => 'member',
        'contribution_xp' => 0,
        'contribution_tasks' => 0,
        'raid_damage' => 0,
    ];

    protected function casts(): array
    {
        return [
            'role' => GuildRole::class,
            'joined_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Guild, $this> */
    public function guild(): BelongsTo
    {
        return $this->belongsTo(Guild::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
