<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->after('project_id')->constrained('tasks')->cascadeOnDelete();
            $table->timestamp('remind_at')->nullable()->after('due_at')->index();
            $table->unsignedInteger('sort_order')->default(0)->after('estimate_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['project_id', 'parent_id', 'remind_at', 'sort_order']);
        });
    }
};
