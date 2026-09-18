<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adventure_encounters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('region_id')->constrained('adventure_regions')->cascadeOnDelete();
            $table->foreignId('enemy_id')->constrained('adventure_enemies')->cascadeOnDelete();
            $table->string('status', 24)->default('active')->index();
            $table->unsignedInteger('enemy_hp_remaining');
            $table->unsignedInteger('hero_hp_remaining');
            $table->unsignedInteger('hero_max_hp');
            $table->unsignedBigInteger('damage_dealt')->default(0);
            $table->unsignedInteger('turns')->default(0);
            $table->unsignedInteger('rests')->default(0);
            $table->json('snapshot')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adventure_encounters');
    }
};
