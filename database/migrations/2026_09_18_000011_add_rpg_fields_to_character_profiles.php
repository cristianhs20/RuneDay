<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('character_profiles', function (Blueprint $table) {
            $table->string('character_name', 60)->nullable()->after('user_id');
            $table->string('archetype', 32)->default('wanderer')->after('character_name');
            $table->json('appearance')->nullable()->after('archetype');
            $table->timestamp('character_created_at')->nullable()->after('appearance');
        });
    }

    public function down(): void
    {
        Schema::table('character_profiles', function (Blueprint $table) {
            $table->dropColumn(['character_name', 'archetype', 'appearance', 'character_created_at']);
        });
    }
};
