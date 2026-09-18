<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_definition_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->string('acquired_from', 32);
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->timestamp('acquired_at');
            $table->timestamps();
            $table->unique(['user_id', 'item_definition_id']);
        });

        Schema::create('equipped_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slot', 32);
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->timestamp('equipped_at');
            $table->timestamps();
            $table->unique(['user_id', 'slot']);
            $table->unique('inventory_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipped_items');
        Schema::dropIfExists('inventory_items');
    }
};
