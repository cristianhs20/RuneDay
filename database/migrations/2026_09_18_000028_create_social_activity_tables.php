<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 48)->index();
            $table->string('visibility', 16)->default('friends')->index();
            $table->string('source_type', 48);
            $table->unsignedBigInteger('source_id');
            $table->json('data');
            $table->timestamps();
            $table->unique(['user_id', 'source_type', 'source_id']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('social_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('social_activities')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 16);
            $table->timestamps();
            $table->unique(['activity_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_reactions');
        Schema::dropIfExists('social_activities');
    }
};
