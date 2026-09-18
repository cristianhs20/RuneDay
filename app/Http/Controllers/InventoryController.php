<?php

namespace App\Http\Controllers;

use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Services\AchievementEngine;
use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Game\Services\EquipmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request, CharacterSnapshot $snapshot): Response
    {
        $items = InventoryItem::query()
            ->where('user_id', $request->user()->id)
            ->with(['item', 'equipment'])
            ->latest('acquired_at')
            ->get()
            ->map(fn (InventoryItem $inventory) => [
                'id' => $inventory->id,
                'acquired_from' => $inventory->acquired_from,
                'acquired_at' => $inventory->acquired_at->toISOString(),
                'equipped' => $inventory->equipment !== null,
                'item' => [
                    'slug' => $inventory->item->slug,
                    'name' => $inventory->item->name,
                    'description' => $inventory->item->description,
                    'slot' => $inventory->item->slot?->value,
                    'rarity' => $inventory->item->rarity->value,
                    'visual_key' => $inventory->item->visual_key,
                    'stats' => $inventory->item->stats ?? [],
                ],
            ]);

        return Inertia::render('game/inventory', [
            'character' => $snapshot->for($request->user()),
            'items' => $items,
        ]);
    }

    public function equip(
        Request $request,
        InventoryItem $inventoryItem,
        EquipmentService $equipment,
        AchievementEngine $achievements,
    ): RedirectResponse {
        abort_unless($inventoryItem->user_id === $request->user()->id, 403);

        $equipped = $equipment->equip($request->user(), $inventoryItem);
        $unlocked = $achievements->evaluate($request->user());

        return back()
            ->with('success', 'Equipment updated.')
            ->with('game_event', [
                'type' => 'equipment_changed',
                'slot' => $equipped->slot->value,
                'achievements' => $unlocked,
            ]);
    }

    public function unequip(
        Request $request,
        string $slot,
        EquipmentService $equipment,
    ): RedirectResponse {
        $equipment->unequip($request->user(), $slot);

        return back()->with('success', 'Item unequipped.');
    }
}
