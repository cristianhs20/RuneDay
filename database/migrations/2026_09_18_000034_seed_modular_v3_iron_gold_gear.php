<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $items = [];

        foreach (range(0, 7) as $variant) {
            $items[] = $this->item('iron-gold-shoulder-'.$variant, 'Iron Gold Pauldrons '.($variant + 1), 'shoulder', 'v3_armor_shoulder_'.$variant, 140 + ($variant * 15), 3 + $variant, ['guard' => 3 + intdiv($variant, 2)], 410 + $variant);
        }

        foreach (range(8, 11) as $variant) {
            $items[] = $this->item('iron-gold-chest-'.$variant, 'Iron Gold Cuirass '.($variant - 7), 'chest', 'v3_armor_chest_'.$variant, 260 + (($variant - 8) * 30), 4 + ($variant - 8), ['guard' => 7 + (($variant - 8) * 2), 'power' => 1 + ($variant - 8)], 430 + $variant);
        }

        foreach (range(12, 17) as $variant) {
            $items[] = $this->item('iron-gold-greaves-'.$variant, 'Iron Gold Greaves '.($variant - 11), 'legs', 'v3_armor_greave_'.$variant, 190 + (($variant - 12) * 20), 3 + intdiv($variant - 12, 2), ['guard' => 4 + intdiv($variant - 12, 2), 'luck' => ($variant - 12) % 2], 450 + $variant);
        }

        foreach ($items as &$item) {
            $item['category'] = 'equipment';
            $item['rarity'] = $item['min_level'] >= 6 ? 'rare' : 'uncommon';
            $item['stats'] = json_encode($item['stats']);
            $item['shop_enabled'] = true;
            $item['drop_enabled'] = true;
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
        }
        unset($item);

        DB::table('item_definitions')->insert($items);
    }

    public function down(): void
    {
        DB::table('item_definitions')->where('visual_key', 'like', 'v3_armor_%')->delete();
    }

    private function item(string $slug, string $name, string $slot, string $visualKey, int $price, int $minLevel, array $stats, int $sort): array
    {
        return [
            'slug' => $slug,
            'name' => $name,
            'description' => 'Forged Iron/Gold armor from the RuneDay Modular V3 library.',
            'slot' => $slot,
            'visual_key' => $visualKey,
            'stats' => $stats,
            'price_gold' => $price,
            'min_level' => $minLevel,
            'sort_order' => $sort,
        ];
    }
};