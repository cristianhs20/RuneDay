<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('timezone', 64)->default('UTC')->after('email');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->timestamp('reminder_sent_at')->nullable()->after('remind_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('reminder_sent_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('timezone');
        });
    }
};
