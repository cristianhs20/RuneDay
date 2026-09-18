<?php

namespace App\Domain\Game\Services;

use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Models\ItemDefinition;

class InventoryGrantService
{
    public function grant(
        int $userId,
        ItemDefinition $item,
        string $acquiredFrom,
        ?string $sourceType = null,
        ?int $sourceId = null,
    ): InventoryItem {
        return InventoryItem::firstOrCreate(
            [
                'user_id' => $userId,
                'item_definition_id' => $item->id,
            ],
            [
                'quantity' => 1,
                'acquired_from' => $acquiredFrom,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'acquired_at' => now(),
            ],
        );
    }
}
