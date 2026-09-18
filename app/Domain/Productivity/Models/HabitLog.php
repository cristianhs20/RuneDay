<?php

namespace App\Domain\Productivity\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $habit_id
 * @property int $user_id
 * @property string $direction
 */
class HabitLog extends Model
{
    protected $fillable = [
        'habit_id', 'user_id', 'direction', 'logged_on', 'logged_at', 'note',
    ];

    protected function casts(): array
    {
        return [
            'logged_on' => 'date',
            'logged_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Habit, $this> */
    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
