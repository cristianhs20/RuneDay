<?php

namespace App\Domain\Adventure\Models;

use App\Domain\Adventure\Enums\EnemyType;
use App\Domain\Game\Enums\ItemRarity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $region_id
 * @property string $slug
 * @property string $name
 * @property string $description
 * @property EnemyType $type
 * @property string $visual_key
 * @property int $max_hp
 * @property int $attack
 * @property int $defense
 * @property int $reward_gold
 * @property int $reward_renown
 * @property ItemRarity|null $boss_reward_rarity
 * @property int $sort_order
 */
class Enemy extends Model
{
    protected $table = 'adventure_enemies';

    protected $fillable = [
        'region_id', 'slug', 'name', 'description', 'type', 'visual_key',
        'max_hp', 'attack', 'defense', 'reward_gold', 'reward_renown',
        'boss_reward_rarity', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'type' => EnemyType::class,
            'boss_reward_rarity' => ItemRarity::class,
        ];
    }

    /** @return BelongsTo<Region, $this> */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    /** @return HasMany<Encounter, $this> */
    public function encounters(): HasMany
    {
        return $this->hasMany(Encounter::class, 'enemy_id');
    }
}
