<?php

namespace App\Domain\Game\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $item_definition_id
 * @property int $gold_spent
 * @property Carbon $purchased_at
 */
class ShopPurchase extends Model
{
    protected $fillable = ['user_id', 'item_definition_id', 'gold_spent', 'purchased_at'];

    protected function casts(): array
    {
        return ['purchased_at' => 'datetime'];
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
}
