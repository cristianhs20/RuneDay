<?php

namespace App\Domain\Productivity\Models;

use App\Domain\Productivity\Enums\TaskDifficulty;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $project_id
 * @property int|null $parent_id
 * @property string $title
 * @property string|null $notes
 * @property string $status
 * @property TaskDifficulty $difficulty
 * @property int $priority
 * @property Carbon|null $due_at
 * @property Carbon|null $remind_at
 * @property int|null $estimate_minutes
 * @property int $sort_order
 * @property Carbon|null $completed_at
 */
class Task extends Model
{
    protected $fillable = [
        'user_id', 'project_id', 'parent_id', 'title', 'notes', 'status',
        'difficulty', 'priority', 'due_at', 'remind_at', 'estimate_minutes',
        'sort_order', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => TaskDifficulty::class,
            'due_at' => 'datetime',
            'remind_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** @return BelongsTo<Task, $this> */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /** @return HasMany<Task, $this> */
    public function subtasks(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order')->orderBy('id');
    }
}
