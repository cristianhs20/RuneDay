<?php

namespace App\Domain\Guild\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string $tag
 * @property string|null $description
 * @property int $leader_id
 * @property int $total_xp
 */
class Guild extends Model
{
    protected $fillable = [
        'slug', 'name', 'tag', 'description', 'leader_id', 'total_xp',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return BelongsTo<User, $this> */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    /** @return HasMany<GuildMember, $this> */
    public function members(): HasMany
    {
        return $this->hasMany(GuildMember::class);
    }

    /** @return HasMany<GuildInvite, $this> */
    public function invites(): HasMany
    {
        return $this->hasMany(GuildInvite::class);
    }

    /** @return HasMany<GuildRaid, $this> */
    public function raids(): HasMany
    {
        return $this->hasMany(GuildRaid::class);
    }
}
