<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\EquippedItem;
use App\Domain\Game\Models\InventoryItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EquipmentService
{
    public function equip(User $user, InventoryItem $inventoryItem): EquippedItem
    {
        return DB::transaction(function () use ($user, $inventoryItem) {
            $inventoryItem = InventoryItem::query()
                ->where('user_id', $user->id)
                ->with('item')
                ->lockForUpdate()
                ->findOrFail($inventoryItem->id);

            $slot = $inventoryItem->item->slot;

            if (! $slot) {
                throw ValidationException::withMessages([
                    'item' => 'This item cannot be equipped.',
                ]);
            }

            EquippedItem::query()
                ->where('inventory_item_id', $inventoryItem->id)
                ->where('user_id', '!=', $user->id)
                ->delete();

            return EquippedItem::updateOrCreate(
                ['user_id' => $user->id, 'slot' => $slot->value],
                ['inventory_item_id' => $inventoryItem->id, 'equipped_at' => now()],
            );
        });
    }

    public function unequip(User $user, string $slot): void
    {
        EquippedItem::query()
            ->where('user_id', $user->id)
            ->where('slot', $slot)
            ->delete();
    }
}
