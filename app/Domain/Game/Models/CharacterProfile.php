<?php

namespace App\Domain\Game\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $user_id
 * @property int $level
 * @property int $xp
 * @property int $gold
 * @property int $total_xp
 */
class CharacterProfile extends Model
{
    protected $fillable = ['user_id', 'level', 'xp', 'gold', 'total_xp'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grant(int $xp, int $gold): void
    {
        $totalXp = $this->total_xp + $xp;
        $this->forceFill([
            'total_xp' => $totalXp,
            'xp' => $totalXp % 100,
            'level' => intdiv($totalXp, 100) + 1,
            'gold' => $this->gold + $gold,
        ])->save();
    }
}
