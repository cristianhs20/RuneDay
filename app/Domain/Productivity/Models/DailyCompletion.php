<?php

namespace App\Domain\Productivity\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $daily_id
 * @property int $user_id
 */
class DailyCompletion extends Model
{
    protected $fillable = ['daily_id', 'user_id', 'completed_on', 'completed_at'];

    protected function casts(): array
    {
        return [
            'completed_on' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Daily, $this> */
    public function daily(): BelongsTo
    {
        return $this->belongsTo(Daily::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
