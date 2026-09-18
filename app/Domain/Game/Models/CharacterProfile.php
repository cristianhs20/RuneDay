<?php

namespace App\Domain\Game\Models;

use App\Domain\Game\Enums\CharacterArchetype;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $user_id
 * @property string|null $character_name
 * @property CharacterArchetype|null $archetype
 * @property array<string, string>|null $appearance
 * @property Carbon|null $character_created_at
 * @property int $level
 * @property int $xp
 * @property int $gold
 * @property int $total_xp
 */
class CharacterProfile extends Model
{
    protected $fillable = [
        'user_id', 'character_name', 'archetype', 'appearance',
        'character_created_at', 'level', 'xp', 'gold', 'total_xp',
    ];

    protected function casts(): array
    {
        return [
            'archetype' => CharacterArchetype::class,
            'appearance' => 'array',
            'character_created_at' => 'datetime',
        ];
    }

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

    public function spendGold(int $amount): bool
    {
        if ($amount < 0 || $this->gold < $amount) {
            return false;
        }

        $this->forceFill(['gold' => $this->gold - $amount])->save();

        return true;
    }

    /**
     * @return array<string, string>
     */
    public static function defaultAppearance(): array
    {
        return [
            'body' => 'type_a',
            'skin_tone' => 'bronze',
            'hair_style' => 'short',
            'hair_color' => 'onyx',
            'eye_color' => 'emerald',
        ];
    }
}
