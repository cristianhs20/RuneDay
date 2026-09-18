<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('character_profiles', function (Blueprint $table) {
            $table->string('lineage', 24)->default('human')->after('archetype');
            $table->string('character_system_version', 16)
                ->default('1.0.0')
                ->after('lineage');
        });
    }

    public function down(): void
    {
        Schema::table('character_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'lineage',
                'character_system_version',
            ]);
        });
    }
};
