<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\CharacterProfile;
use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Models\ItemDefinition;
use App\Domain\Game\Models\RewardTransaction;
use App\Domain\Game\Models\ShopPurchase;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShopService
{
    public function __construct(private readonly InventoryGrantService $inventory) {}

    /**
     * @return array{purchase: ShopPurchase, inventory_item: InventoryItem, profile: CharacterProfile}
     */
    public function purchase(User $user, ItemDefinition $item): array
    {
        return DB::transaction(function () use ($user, $item) {
            $item = ItemDefinition::query()->lockForUpdate()->findOrFail($item->id);

            if (! $item->shop_enabled) {
                throw ValidationException::withMessages([
                    'item' => 'This item is not available in the shop.',
                ]);
            }

            $profile = CharacterProfile::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $profile) {
                $profile = CharacterProfile::create(['user_id' => $user->id]);
                $profile = CharacterProfile::query()
                    ->whereKey($profile->id)
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            if ($profile->level < $item->min_level) {
                throw ValidationException::withMessages([
                    'item' => 'Your hero has not reached the required level.',
                ]);
            }

            if (InventoryItem::query()
                ->where('user_id', $user->id)
                ->where('item_definition_id', $item->id)
                ->exists()) {
                throw ValidationException::withMessages([
                    'item' => 'You already own this item.',
                ]);
            }

            if (! $profile->spendGold($item->price_gold)) {
                throw ValidationException::withMessages([
                    'gold' => 'Not enough gold.',
                ]);
            }

            $purchase = ShopPurchase::create([
                'user_id' => $user->id,
                'item_definition_id' => $item->id,
                'gold_spent' => $item->price_gold,
                'purchased_at' => now(),
            ]);

            $inventoryItem = $this->inventory->grant(
                $user->id,
                $item,
                'shop',
                'shop_purchase',
                $purchase->id,
            );

            RewardTransaction::create([
                'user_id' => $user->id,
                'source_type' => 'shop_purchase',
                'source_id' => $purchase->id,
                'xp_delta' => 0,
                'gold_delta' => -$item->price_gold,
                'metadata' => ['item' => $item->slug],
            ]);

            return [
                'purchase' => $purchase,
                'inventory_item' => $inventoryItem->load('item'),
                'profile' => $profile->fresh(),
            ];
        });
    }
}
