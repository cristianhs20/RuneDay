<?php

namespace App\Domain\Adventure\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $source_type
 * @property int $source_id
 * @property int $renown_delta
 * @property array<string, mixed>|null $metadata
 */
class AdventureTransaction extends Model
{
    protected $table = 'adventure_transactions';

    protected $fillable = [
        'user_id', 'source_type', 'source_id', 'renown_delta', 'metadata',
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
