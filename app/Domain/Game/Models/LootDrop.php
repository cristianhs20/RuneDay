<?php

namespace App\Domain\Game\Models;

use App\Domain\Game\Enums\ItemRarity;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $source_type
 * @property int $source_id
 * @property int|null $item_definition_id
 * @property int|null $inventory_item_id
 * @property ItemRarity|null $rarity
 * @property int $roll
 * @property bool $dropped
 * @property array<string, mixed>|null $metadata
 */
class LootDrop extends Model
{
    protected $fillable = [
        'user_id', 'source_type', 'source_id', 'item_definition_id',
        'inventory_item_id', 'rarity', 'roll', 'dropped', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'rarity' => ItemRarity::class,
            'dropped' => 'boolean',
            'metadata' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<ItemDefinition, $this> */
    public function item(): BelongsTo
    {
        return $this->belongsTo(ItemDefinition::class, 'item_definition_id');
    }

    /** @return BelongsTo<InventoryItem, $this> */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
