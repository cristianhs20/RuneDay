<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adventure_objectives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained('adventure_regions')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('name', 120);
            $table->text('description');
            $table->string('criteria_type', 48);
            $table->unsignedInteger('threshold');
            $table->unsignedInteger('reward_gold')->default(0);
            $table->unsignedInteger('reward_renown')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('adventure_objective_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('objective_id')->constrained('adventure_objectives')->cascadeOnDelete();
            $table->timestamp('claimed_at');
            $table->timestamps();
            $table->unique(['user_id', 'objective_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adventure_objective_claims');
        Schema::dropIfExists('adventure_objectives');
    }
};
