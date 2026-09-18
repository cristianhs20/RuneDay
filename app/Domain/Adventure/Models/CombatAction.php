<?php

namespace App\Domain\Adventure\Models;

use App\Domain\Productivity\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $encounter_id
 * @property int|null $task_id
 * @property string $source_type
 * @property int $source_id
 * @property int $damage
 * @property bool $critical
 * @property int $enemy_damage
 * @property int $enemy_hp_after
 * @property int $hero_hp_after
 * @property bool $rested
 * @property float $reward_factor
 * @property array<string, mixed>|null $metadata
 */
class CombatAction extends Model
{
    protected $table = 'adventure_combat_actions';

    protected $fillable = [
        'user_id', 'encounter_id', 'task_id', 'source_type', 'source_id',
        'damage', 'critical', 'enemy_damage', 'enemy_hp_after',
        'hero_hp_after', 'rested', 'reward_factor', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'critical' => 'boolean',
            'rested' => 'boolean',
            'reward_factor' => 'float',
            'metadata' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Encounter, $this> */
    public function encounter(): BelongsTo
    {
        return $this->belongsTo(Encounter::class, 'encounter_id');
    }

    /** @return BelongsTo<Task, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
