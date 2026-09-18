<?php

namespace App\Domain\Game\Models;

use App\Domain\Game\Enums\ItemSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property ItemSlot $slot
 * @property int $inventory_item_id
 * @property Carbon $equipped_at
 */
class EquippedItem extends Model
{
    protected $fillable = ['user_id', 'slot', 'inventory_item_id', 'equipped_at'];

    protected function casts(): array
    {
        return [
            'slot' => ItemSlot::class,
            'equipped_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<InventoryItem, $this> */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
