<?php

namespace App\Domain\Adventure\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $renown
 * @property int $total_damage
 * @property int $victories
 * @property int $boss_victories
 */
class AdventureProfile extends Model
{
    protected $table = 'adventure_profiles';

    protected $attributes = [
        'renown' => 0,
        'total_damage' => 0,
        'victories' => 0,
        'boss_victories' => 0,
    ];

    protected $fillable = [
        'user_id', 'renown', 'total_damage', 'victories', 'boss_victories',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
