<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adventure_enemies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained('adventure_regions')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name', 120);
            $table->text('description');
            $table->string('type', 24)->default('normal')->index();
            $table->string('visual_key', 80);
            $table->unsignedInteger('max_hp');
            $table->unsignedSmallInteger('attack');
            $table->unsignedSmallInteger('defense');
            $table->unsignedInteger('reward_gold')->default(0);
            $table->unsignedInteger('reward_renown')->default(0);
            $table->string('boss_reward_rarity', 24)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adventure_enemies');
    }
};
