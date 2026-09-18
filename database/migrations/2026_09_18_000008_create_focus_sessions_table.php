<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('focus_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('duration_minutes');
            $table->timestamp('started_at');
            $table->timestamp('completed_at');
            $table->string('mode')->default('focus');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('focus_sessions');
    }
};
