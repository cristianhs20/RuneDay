<?php

namespace App\Domain\Productivity\Models;

use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $notes
 * @property string $mode
 * @property TaskDifficulty $difficulty
 * @property bool $is_active
 */
class Habit extends Model
{
    protected $fillable = ['user_id', 'title', 'notes', 'mode', 'difficulty', 'is_active'];

    protected function casts(): array
    {
        return [
            'difficulty' => TaskDifficulty::class,
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<HabitLog, $this> */
    public function logs(): HasMany
    {
        return $this->hasMany(HabitLog::class);
    }
}
