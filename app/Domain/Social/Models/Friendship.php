<?php

namespace App\Domain\Social\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_low_id
 * @property int $user_high_id
 * @property Carbon $accepted_at
 */
class Friendship extends Model
{
    protected $fillable = [
        'user_low_id', 'user_high_id', 'accepted_at',
    ];

    protected function casts(): array
    {
        return ['accepted_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function lowUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_low_id');
    }

    /** @return BelongsTo<User, $this> */
    public function highUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_high_id');
    }
}
