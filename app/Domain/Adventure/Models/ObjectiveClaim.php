<?php

namespace App\Domain\Adventure\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $objective_id
 * @property Carbon $claimed_at
 */
class ObjectiveClaim extends Model
{
    protected $table = 'adventure_objective_claims';

    protected $fillable = ['user_id', 'objective_id', 'claimed_at'];

    protected function casts(): array
    {
        return ['claimed_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<AdventureObjective, $this> */
    public function objective(): BelongsTo
    {
        return $this->belongsTo(AdventureObjective::class, 'objective_id');
    }
}
