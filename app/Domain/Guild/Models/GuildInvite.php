<?php

namespace App\Domain\Guild\Models;

use App\Domain\Guild\Enums\GuildInviteStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $guild_id
 * @property int $inviter_id
 * @property int $receiver_id
 * @property GuildInviteStatus $status
 * @property Carbon|null $responded_at
 */
class GuildInvite extends Model
{
    protected $fillable = [
        'guild_id', 'inviter_id', 'receiver_id', 'status', 'responded_at',
    ];

    protected $attributes = ['status' => 'pending'];

    protected function casts(): array
    {
        return [
            'status' => GuildInviteStatus::class,
            'responded_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Guild, $this> */
    public function guild(): BelongsTo
    {
        return $this->belongsTo(Guild::class);
    }

    /** @return BelongsTo<User, $this> */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    /** @return BelongsTo<User, $this> */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
