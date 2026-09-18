<?php

namespace App\Domain\Productivity\Models;

use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $notes
 * @property TaskDifficulty $difficulty
 * @property string $frequency
 * @property array<int, int>|null $days_of_week
 * @property bool $is_active
 * @property Carbon|null $starts_on
 * @property Carbon|null $ends_on
 */
class Daily extends Model
{
    protected $fillable = [
        'user_id', 'title', 'notes', 'difficulty', 'frequency',
        'days_of_week', 'is_active', 'starts_on', 'ends_on',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => TaskDifficulty::class,
            'days_of_week' => 'array',
            'is_active' => 'boolean',
            'starts_on' => 'date',
            'ends_on' => 'date',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<DailyCompletion, $this> */
    public function completions(): HasMany
    {
        return $this->hasMany(DailyCompletion::class);
    }

    public function isDueOn(CarbonInterface $date): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_on && $date->lt($this->starts_on)) {
            return false;
        }

        if ($this->ends_on && $date->gt($this->ends_on)) {
            return false;
        }

        if ($this->frequency === 'weekly') {
            return in_array($date->dayOfWeekIso, $this->days_of_week ?? [], true);
        }

        return true;
    }
}
