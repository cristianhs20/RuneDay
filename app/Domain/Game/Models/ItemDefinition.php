<?php

namespace App\Domain\Game\Models;

use App\Domain\Game\Enums\ItemRarity;
use App\Domain\Game\Enums\ItemSlot;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string|null $description
 * @property string $category
 * @property ItemSlot|null $slot
 * @property ItemRarity $rarity
 * @property string $visual_key
 * @property array<string, int>|null $stats
 * @property int $price_gold
 * @property bool $shop_enabled
 * @property bool $drop_enabled
 * @property int $min_level
 * @property int $sort_order
 */
class ItemDefinition extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'category', 'slot', 'rarity',
        'visual_key', 'stats', 'price_gold', 'shop_enabled',
        'drop_enabled', 'min_level', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'slot' => ItemSlot::class,
            'rarity' => ItemRarity::class,
            'stats' => 'array',
            'shop_enabled' => 'boolean',
            'drop_enabled' => 'boolean',
        ];
    }

    /** @return HasMany<InventoryItem, $this> */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }
}
