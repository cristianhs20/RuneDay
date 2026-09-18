<?php

namespace App\Domain\Guild\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $guild_id
 * @property int|null $user_id
 * @property string $source_type
 * @property int $source_id
 * @property int $xp_delta
 * @property array<string, mixed>|null $metadata
 */
class GuildXpTransaction extends Model
{
    protected $fillable = [
        'guild_id', 'user_id', 'source_type', 'source_id', 'xp_delta', 'metadata',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
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
