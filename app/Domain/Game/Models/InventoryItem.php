<?php

namespace App\Domain\Game\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $item_definition_id
 * @property int $quantity
 * @property string $acquired_from
 * @property string|null $source_type
 * @property int|null $source_id
 * @property Carbon $acquired_at
 */
class InventoryItem extends Model
{
    protected $fillable = [
        'user_id', 'item_definition_id', 'quantity', 'acquired_from',
        'source_type', 'source_id', 'acquired_at',
    ];

    protected function casts(): array
    {
        return ['acquired_at' => 'datetime'];
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

    /** @return HasOne<EquippedItem, $this> */
    public function equipment(): HasOne
    {
        return $this->hasOne(EquippedItem::class);
    }
}
