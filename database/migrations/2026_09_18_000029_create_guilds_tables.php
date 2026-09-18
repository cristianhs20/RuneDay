<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guilds', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name', 60)->unique();
            $table->string('tag', 5)->unique();
            $table->text('description')->nullable();
            $table->foreignId('leader_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('total_xp')->default(0);
            $table->timestamps();
        });

        Schema::create('guild_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('role', 16)->default('member')->index();
            $table->unsignedBigInteger('contribution_xp')->default(0);
            $table->unsignedInteger('contribution_tasks')->default(0);
            $table->unsignedBigInteger('raid_damage')->default(0);
            $table->timestamp('joined_at');
            $table->timestamps();
            $table->unique(['guild_id', 'user_id']);
            $table->index(['guild_id', 'role']);
        });

        Schema::create('guild_invites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inviter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 16)->default('pending')->index();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            $table->unique(['guild_id', 'receiver_id']);
            $table->index(['receiver_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guild_invites');
        Schema::dropIfExists('guild_members');
        Schema::dropIfExists('guilds');
    }
};
