<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('handle', 32)->unique();
            $table->string('friend_code', 12)->unique();
            $table->string('bio', 180)->nullable();
            $table->string('profile_visibility', 16)->default('friends')->index();
            $table->string('activity_visibility', 16)->default('friends')->index();
            $table->boolean('friend_requests_enabled')->default(true);
            $table->boolean('show_adventure')->default(true);
            $table->boolean('show_stats')->default(true);
            $table->boolean('show_achievements')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_profiles');
    }
};
