<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adventure_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('renown')->default(0);
            $table->unsignedBigInteger('total_damage')->default(0);
            $table->unsignedInteger('victories')->default(0);
            $table->unsignedInteger('boss_victories')->default(0);
            $table->timestamps();
        });

        Schema::create('adventure_region_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('region_id')->constrained('adventure_regions')->cascadeOnDelete();
            $table->unsignedInteger('enemy_victories')->default(0);
            $table->timestamp('boss_defeated_at')->nullable();
            $table->timestamp('first_entered_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'region_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adventure_region_progress');
        Schema::dropIfExists('adventure_profiles');
    }
};
