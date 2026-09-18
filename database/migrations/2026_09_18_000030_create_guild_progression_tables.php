<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guild_xp_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source_type', 48);
            $table->unsignedBigInteger('source_id');
            $table->integer('xp_delta');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['guild_id', 'source_type', 'source_id']);
            $table->unique(['user_id', 'source_type', 'source_id']);
        });

        Schema::create('guild_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->string('source_type', 48);
            $table->unsignedBigInteger('source_id');
            $table->unsignedInteger('guild_xp')->default(0);
            $table->decimal('reward_factor', 4, 2)->default(1);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'source_type', 'source_id']);
            $table->index(['guild_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guild_contributions');
        Schema::dropIfExists('guild_xp_transactions');
    }
};
