<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adventure_combat_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('encounter_id')->constrained('adventure_encounters')->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->string('source_type', 48);
            $table->unsignedBigInteger('source_id');
            $table->unsignedInteger('damage')->default(0);
            $table->boolean('critical')->default(false);
            $table->unsignedInteger('enemy_damage')->default(0);
            $table->unsignedInteger('enemy_hp_after');
            $table->unsignedInteger('hero_hp_after');
            $table->boolean('rested')->default(false);
            $table->decimal('reward_factor', 4, 2)->default(1);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'source_type', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adventure_combat_actions');
    }
};
