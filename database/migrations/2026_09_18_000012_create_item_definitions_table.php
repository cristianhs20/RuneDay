<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('category', 32)->default('equipment');
            $table->string('slot', 32)->nullable()->index();
            $table->string('rarity', 24)->default('common')->index();
            $table->string('visual_key', 80);
            $table->json('stats')->nullable();
            $table->unsignedInteger('price_gold')->default(0);
            $table->boolean('shop_enabled')->default(false)->index();
            $table->boolean('drop_enabled')->default(true)->index();
            $table->unsignedSmallInteger('min_level')->default(1);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_definitions');
    }
};
