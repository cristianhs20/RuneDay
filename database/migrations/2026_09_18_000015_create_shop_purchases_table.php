<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_definition_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('gold_spent');
            $table->timestamp('purchased_at');
            $table->timestamps();
            $table->unique(['user_id', 'item_definition_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_purchases');
    }
};
