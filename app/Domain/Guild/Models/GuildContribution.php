<?php

namespace App\Domain\Guild\Models;

use App\Domain\Productivity\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $guild_id
 * @property int $user_id
 * @property int|null $task_id
 * @property string $source_type
 * @property int $source_id
 * @property int $guild_xp
 * @property float $reward_factor
 * @property array<string, mixed>|null $metadata
 */
class GuildContribution extends Model
{
    protected $fillable = [
        'guild_id', 'user_id', 'task_id', 'source_type', 'source_id',
        'guild_xp', 'reward_factor', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'reward_factor' => 'float',
            'metadata' => 'array',
        ];
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

    /** @return BelongsTo<Task, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
