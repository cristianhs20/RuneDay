<?php

namespace App\Http\Controllers;

use App\Domain\Game\Models\InventoryItem;
use App\Domain\Game\Models\ItemDefinition;
use App\Domain\Game\Services\CharacterSnapshot;
use App\Domain\Game\Services\ShopService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request, CharacterSnapshot $snapshot): Response
    {
        $owned = InventoryItem::query()
            ->where('user_id', $request->user()->id)
            ->pluck('item_definition_id')
            ->all();

        $items = ItemDefinition::query()
            ->where('shop_enabled', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (ItemDefinition $item) => [
                'id' => $item->id,
                'slug' => $item->slug,
                'name' => $item->name,
                'description' => $item->description,
                'slot' => $item->slot?->value,
                'rarity' => $item->rarity->value,
                'visual_key' => $item->visual_key,
                'stats' => $item->stats ?? [],
                'price_gold' => $item->price_gold,
                'min_level' => $item->min_level,
                'owned' => in_array($item->id, $owned, true),
            ]);

        return Inertia::render('game/shop', [
            'character' => $snapshot->for($request->user()),
            'items' => $items,
        ]);
    }

    public function purchase(
        Request $request,
        ItemDefinition $item,
        ShopService $shop,
    ): RedirectResponse {
        $result = $shop->purchase($request->user(), $item);
        $bought = $result['inventory_item']->item;

        return back()
            ->with('success', $bought->name.' added to your inventory.')
            ->with('game_event', [
                'type' => 'shop_purchase',
                'item' => [
                    'name' => $bought->name,
                    'rarity' => $bought->rarity->value,
                    'visual_key' => $bought->visual_key,
                ],
                'gold_spent' => $result['purchase']->gold_spent,
            ]);
    }
}
