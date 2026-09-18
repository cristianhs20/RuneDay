<?php

namespace App\Domain\Social\Models;

use App\Domain\Social\Enums\SocialVisibility;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property SocialVisibility $visibility
 * @property string $source_type
 * @property int $source_id
 * @property array<string, mixed> $data
 */
class SocialActivity extends Model
{
    protected $fillable = [
        'user_id', 'type', 'visibility', 'source_type', 'source_id', 'data',
    ];

    protected function casts(): array
    {
        return [
            'visibility' => SocialVisibility::class,
            'data' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SocialReaction, $this> */
    public function reactions(): HasMany
    {
        return $this->hasMany(SocialReaction::class, 'activity_id');
    }
}
