<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $items = [
            ['slug' => 'training-sword', 'name' => 'Training Sword', 'description' => 'A balanced starter blade.', 'slot' => 'weapon', 'rarity' => 'common', 'visual_key' => 'weapon_training_sword', 'stats' => ['power' => 2], 'price_gold' => 35, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 10],
            ['slug' => 'linen-tunic', 'name' => 'Linen Tunic', 'description' => 'Simple gear for the first miles.', 'slot' => 'chest', 'rarity' => 'common', 'visual_key' => 'chest_linen_tunic', 'stats' => ['guard' => 2], 'price_gold' => 30, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 20],
            ['slug' => 'traveler-hood', 'name' => 'Traveler Hood', 'description' => 'Keeps the road out of your eyes.', 'slot' => 'head', 'rarity' => 'common', 'visual_key' => 'head_traveler_hood', 'stats' => ['focus' => 1], 'price_gold' => 28, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 30],
            ['slug' => 'simple-boots', 'name' => 'Simple Boots', 'description' => 'Reliable boots for steady progress.', 'slot' => 'feet', 'rarity' => 'common', 'visual_key' => 'feet_simple_boots', 'stats' => ['guard' => 1], 'price_gold' => 25, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 40],
            ['slug' => 'small-satchel', 'name' => 'Small Satchel', 'description' => 'Carries exactly what matters.', 'slot' => 'back', 'rarity' => 'common', 'visual_key' => 'back_small_satchel', 'stats' => ['luck' => 1], 'price_gold' => 32, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 50],
            ['slug' => 'copper-charm', 'name' => 'Copper Charm', 'description' => 'A small token of momentum.', 'slot' => 'accessory', 'rarity' => 'common', 'visual_key' => 'accessory_copper_charm', 'stats' => ['luck' => 1], 'price_gold' => 40, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 60],

            ['slug' => 'mossblade', 'name' => 'Mossblade', 'description' => 'A forest-forged edge with a calm glow.', 'slot' => 'weapon', 'rarity' => 'uncommon', 'visual_key' => 'weapon_mossblade', 'stats' => ['power' => 5, 'focus' => 1], 'price_gold' => 110, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 110],
            ['slug' => 'scout-hood', 'name' => 'Scout Hood', 'description' => 'Lightweight protection for sharp eyes.', 'slot' => 'head', 'rarity' => 'uncommon', 'visual_key' => 'head_scout_hood', 'stats' => ['focus' => 4], 'price_gold' => 95, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 120],
            ['slug' => 'ranger-vest', 'name' => 'Ranger Vest', 'description' => 'Flexible armor for long campaigns.', 'slot' => 'chest', 'rarity' => 'uncommon', 'visual_key' => 'chest_ranger_vest', 'stats' => ['guard' => 4, 'focus' => 1], 'price_gold' => 120, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 130],
            ['slug' => 'trail-boots', 'name' => 'Trail Boots', 'description' => 'Made for people who keep moving.', 'slot' => 'feet', 'rarity' => 'uncommon', 'visual_key' => 'feet_trail_boots', 'stats' => ['guard' => 2, 'luck' => 2], 'price_gold' => 90, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 140],
            ['slug' => 'adventurer-cape', 'name' => 'Adventurer Cape', 'description' => 'A cape that has seen a few good stories.', 'slot' => 'back', 'rarity' => 'uncommon', 'visual_key' => 'back_adventurer_cape', 'stats' => ['guard' => 2, 'luck' => 2], 'price_gold' => 125, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 150],
            ['slug' => 'emerald-token', 'name' => 'Emerald Token', 'description' => 'A polished rune for fortunate routes.', 'slot' => 'accessory', 'rarity' => 'uncommon', 'visual_key' => 'accessory_emerald_token', 'stats' => ['luck' => 4], 'price_gold' => 115, 'shop_enabled' => true, 'drop_enabled' => true, 'sort_order' => 160],

            ['slug' => 'moonsteel-blade', 'name' => 'Moonsteel Blade', 'description' => 'Cold steel that catches light like moonwater.', 'slot' => 'weapon', 'rarity' => 'rare', 'visual_key' => 'weapon_moonsteel_blade', 'stats' => ['power' => 10, 'focus' => 2], 'price_gold' => 320, 'shop_enabled' => false, 'drop_enabled' => true, 'sort_order' => 210],
            ['slug' => 'azure-circlet', 'name' => 'Azure Circlet', 'description' => 'A focused mind wears little weight.', 'slot' => 'head', 'rarity' => 'rare', 'visual_key' => 'head_azure_circlet', 'stats' => ['focus' => 8, 'luck' => 2], 'price_gold' => 280, 'shop_enabled' => false, 'drop_enabled' => true, 'sort_order' => 220],
            ['slug' => 'runic-armor', 'name' => 'Runic Armor', 'description' => 'Etched plates that hum under pressure.', 'slot' => 'chest', 'rarity' => 'rare', 'visual_key' => 'chest_runic_armor', 'stats' => ['guard' => 10, 'power' => 2], 'price_gold' => 350, 'shop_enabled' => false, 'drop_enabled' => true, 'sort_order' => 230],
            ['slug' => 'shadow-boots', 'name' => 'Shadow Boots', 'description' => 'Quiet steps, decisive movement.', 'slot' => 'feet', 'rarity' => 'rare', 'visual_key' => 'feet_shadow_boots', 'stats' => ['guard' => 4, 'luck' => 6], 'price_gold' => 300, 'shop_enabled' => false, 'drop_enabled' => true, 'sort_order' => 240],
            ['slug' => 'starcloak', 'name' => 'Starcloak', 'description' => 'A deep-blue cloak dusted with tiny lights.', 'slot' => 'back', 'rarity' => 'rare', 'visual_key' => 'back_starcloak', 'stats' => ['focus' => 5, 'luck' => 5], 'price_gold' => 340, 'shop_enabled' => false, 'drop_enabled' => true, 'sort_order' => 250],
            ['slug' => 'lucky-rune', 'name' => 'Lucky Rune', 'description' => 'Its edges are worn smooth by improbable outcomes.', 'slot' => 'accessory', 'rarity' => 'rare', 'visual_key' => 'accessory_lucky_rune', 'stats' => ['luck' => 10], 'price_gold' => 330, 'shop_enabled' => false, 'drop_enabled' => true, 'sort_order' => 260],

            ['slug' => 'emberfang', 'name' => 'Emberfang', 'description' => 'An epic blade with a restrained inner flame.', 'slot' => 'weapon', 'rarity' => 'epic', 'visual_key' => 'weapon_emberfang', 'stats' => ['power' => 18, 'luck' => 3], 'price_gold' => 900, 'shop_enabled' => false, 'drop_enabled' => true, 'min_level' => 5, 'sort_order' => 310],
            ['slug' => 'crown-of-dawn', 'name' => 'Crown of Dawn', 'description' => 'A narrow crown made for earned victories.', 'slot' => 'head', 'rarity' => 'epic', 'visual_key' => 'head_crown_of_dawn', 'stats' => ['focus' => 12, 'power' => 4], 'price_gold' => 850, 'shop_enabled' => false, 'drop_enabled' => true, 'min_level' => 5, 'sort_order' => 320],
            ['slug' => 'dragonplate', 'name' => 'Dragonplate', 'description' => 'Dense armor built for impossible weeks.', 'slot' => 'chest', 'rarity' => 'epic', 'visual_key' => 'chest_dragonplate', 'stats' => ['guard' => 18, 'power' => 3], 'price_gold' => 950, 'shop_enabled' => false, 'drop_enabled' => true, 'min_level' => 5, 'sort_order' => 330],
            ['slug' => 'voidwalkers', 'name' => 'Voidwalkers', 'description' => 'Boots that seem half a step ahead.', 'slot' => 'feet', 'rarity' => 'epic', 'visual_key' => 'feet_voidwalkers', 'stats' => ['guard' => 6, 'luck' => 12], 'price_gold' => 880, 'shop_enabled' => false, 'drop_enabled' => true, 'min_level' => 5, 'sort_order' => 340],
            ['slug' => 'phoenix-mantle', 'name' => 'Phoenix Mantle', 'description' => 'A mantle that turns setbacks into heat.', 'slot' => 'back', 'rarity' => 'epic', 'visual_key' => 'back_phoenix_mantle', 'stats' => ['focus' => 8, 'guard' => 8], 'price_gold' => 920, 'shop_enabled' => false, 'drop_enabled' => true, 'min_level' => 5, 'sort_order' => 350],
            ['slug' => 'astral-sigil', 'name' => 'Astral Sigil', 'description' => 'A rare mark for unusually consistent heroes.', 'slot' => 'accessory', 'rarity' => 'epic', 'visual_key' => 'accessory_astral_sigil', 'stats' => ['luck' => 14, 'focus' => 4], 'price_gold' => 900, 'shop_enabled' => false, 'drop_enabled' => true, 'min_level' => 5, 'sort_order' => 360],
        ];

        foreach ($items as &$item) {
            $item['category'] = 'equipment';
            $item['stats'] = json_encode($item['stats']);
            $item['min_level'] = $item['min_level'] ?? 1;
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
        }
        unset($item);

        DB::table('item_definitions')->insert($items);

        DB::table('achievements')->insert([
            ['slug' => 'first-step', 'name' => 'First Step', 'description' => 'Complete your first quest.', 'icon' => 'footprints', 'criteria_type' => 'quests_completed', 'threshold' => 1, 'reward_xp' => 20, 'reward_gold' => 10, 'sort_order' => 10, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'questline', 'name' => 'Questline', 'description' => 'Complete 10 quests.', 'icon' => 'scroll-text', 'criteria_type' => 'quests_completed', 'threshold' => 10, 'reward_xp' => 80, 'reward_gold' => 40, 'sort_order' => 20, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'level-five', 'name' => 'Seasoned', 'description' => 'Reach level 5.', 'icon' => 'sparkles', 'criteria_type' => 'level', 'threshold' => 5, 'reward_xp' => 100, 'reward_gold' => 50, 'sort_order' => 30, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'treasure-found', 'name' => 'Treasure Found', 'description' => 'Find your first loot drop.', 'icon' => 'gem', 'criteria_type' => 'loot_found', 'threshold' => 1, 'reward_xp' => 35, 'reward_gold' => 15, 'sort_order' => 40, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'suited-up', 'name' => 'Suited Up', 'description' => 'Equip four gear slots at the same time.', 'icon' => 'shield', 'criteria_type' => 'items_equipped', 'threshold' => 4, 'reward_xp' => 60, 'reward_gold' => 25, 'sort_order' => 50, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'deep-work', 'name' => 'Deep Work', 'description' => 'Accumulate 120 focused minutes.', 'icon' => 'timer', 'criteria_type' => 'focus_minutes', 'threshold' => 120, 'reward_xp' => 70, 'reward_gold' => 25, 'sort_order' => 60, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'habit-builder', 'name' => 'Habit Builder', 'description' => 'Record 25 habit actions.', 'icon' => 'flame', 'criteria_type' => 'habit_logs', 'threshold' => 25, 'reward_xp' => 70, 'reward_gold' => 25, 'sort_order' => 70, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        DB::table('achievement_unlocks')->delete();
        DB::table('achievements')->delete();
        DB::table('equipped_items')->delete();
        DB::table('inventory_items')->delete();
        DB::table('loot_drops')->delete();
        DB::table('shop_purchases')->delete();
        DB::table('item_definitions')->delete();
    }
};
