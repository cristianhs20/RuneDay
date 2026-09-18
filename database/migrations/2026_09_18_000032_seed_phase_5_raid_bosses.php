<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('raid_bosses')->insert([
            [
                'slug' => 'briar-colossus',
                'name' => 'Briar Colossus',
                'description' => 'A moving wall of roots and thornwood that only coordinated effort can break.',
                'visual_key' => 'raid_briar_colossus',
                'max_hp' => 1200,
                'min_hall_level' => 1,
                'duration_hours' => 72,
                'reward_guild_xp' => 300,
                'reward_member_xp' => 50,
                'reward_member_gold' => 35,
                'sort_order' => 10,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'ashen-behemoth',
                'name' => 'Ashen Behemoth',
                'description' => 'A volcanic titan whose armor cools only when an entire guild keeps pressure on it.',
                'visual_key' => 'raid_ashen_behemoth',
                'max_hp' => 3000,
                'min_hall_level' => 2,
                'duration_hours' => 72,
                'reward_guild_xp' => 700,
                'reward_member_xp' => 100,
                'reward_member_gold' => 70,
                'sort_order' => 20,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'moon-eater',
                'name' => 'Moon-Eater',
                'description' => 'A colossal void creature that appears above mature guild halls for a limited assault window.',
                'visual_key' => 'raid_moon_eater',
                'max_hp' => 6000,
                'min_hall_level' => 3,
                'duration_hours' => 96,
                'reward_guild_xp' => 1500,
                'reward_member_xp' => 180,
                'reward_member_gold' => 120,
                'sort_order' => 30,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('raid_bosses')->delete();
    }
};
