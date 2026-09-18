<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raid_bosses', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name', 120);
            $table->text('description');
            $table->string('visual_key', 80);
            $table->unsignedInteger('max_hp');
            $table->unsignedSmallInteger('min_hall_level')->default(1);
            $table->unsignedSmallInteger('duration_hours')->default(72);
            $table->unsignedInteger('reward_guild_xp')->default(0);
            $table->unsignedInteger('reward_member_xp')->default(0);
            $table->unsignedInteger('reward_member_gold')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('guild_raids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raid_boss_id')->constrained('raid_bosses')->cascadeOnDelete();
            $table->string('status', 16)->default('active')->index();
            $table->unsignedInteger('hp_remaining');
            $table->unsignedBigInteger('total_damage')->default(0);
            $table->timestamp('started_at');
            $table->timestamp('ends_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
            $table->index(['guild_id', 'status']);
        });

        Schema::create('guild_raid_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_raid_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guild_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->string('source_type', 48);
            $table->unsignedBigInteger('source_id');
            $table->unsignedInteger('damage')->default(0);
            $table->boolean('critical')->default(false);
            $table->decimal('reward_factor', 4, 2)->default(1);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'source_type', 'source_id']);
            $table->index(['guild_raid_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guild_raid_contributions');
        Schema::dropIfExists('guild_raids');
        Schema::dropIfExists('raid_bosses');
    }
};
