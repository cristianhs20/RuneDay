<?php

namespace App\Domain\Game\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $user_id
 * @property string $source_type
 * @property int $source_id
 * @property int $xp_delta
 * @property int $gold_delta
 * @property array<string, mixed>|null $metadata
 * @property Carbon|null $created_at
 */
class RewardTransaction extends Model
{
    protected $fillable = [
        'user_id', 'source_type', 'source_id', 'xp_delta', 'gold_delta', 'metadata',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
